require('../../bootstrap');

const path = require('path');
const dotenvSafe = require('dotenv-safe');

const sinon = require('sinon');

const MNDiscovery = require('../../../src/MNDiscovery/index');
const {startDapi} = require('@axerunners/js-evo-services-ctl');
const DAPIClient = require('../../../src/index');

const AxePlatformProtocol = require('@axerunners/app');
const entropy = require('@axerunners/app/lib/util/entropy');
const DPObject = require('@axerunners/app/lib/object/DPObject');

const {
    Transaction,
    PrivateKey,
    PublicKey,
    Address,
} = require('@axerunners/axecore-lib');

const wait = require('../../utils/wait');

process.env.NODE_ENV = 'test';

dotenvSafe.config({
    sample : path.resolve(__dirname, '../.env'),
    path: path.resolve(__dirname, '../.env'),
});

describe('basic E2E tests', () => {
    let masterNode;

    const attempts = 60;

    let app;

    let dapiClient;

    let faucetPrivateKey;
    let faucetAddress;

    let bobPrivateKey;
    let bobUserName;
    let bobRegTxId;
    let alicePrivateKey;
    let aliceUserName;
    let aliceRegTxId;

    let aliceUser;
    let aliceContactAcceptance;

    let bobPreviousST;
    let alicePreviousST;

    before(async () => {
        app = new AxePlatformProtocol();
        const privKey = "cVwyvFt95dzwEqYCLd8pv9CzktajP4tWH2w9RQNPeHYA7pH35wcJ";
        faucetPrivateKey = new PrivateKey(privKey);

        const faucetPublicKey = PublicKey.fromPrivateKey(faucetPrivateKey);

        faucetAddress = Address
            .fromPublicKey(faucetPublicKey, 'testnet')
            .toString();

        bobUserName = Math.random().toString(36).substring(7);
        aliceUserName = Math.random().toString(36).substring(7);

        const dpContract = app.contract.create(entropy.generate().substr(0, 24), {
            user: {
                properties: {
                    avatarUrl: {
                        type: 'string',
                        format: 'url',
                    },
                    about: {
                        type: 'string',
                    },
                },
                required: ['avatarUrl', 'about'],
                additionalProperties: false,
            },
            contact: {
                properties: {
                    toUserId: {
                        type: 'string',
                    },
                    publicKey: {
                        type: 'string',
                    },
                },
                required: ['toUserId', 'publicKey'],
                additionalProperties: false,
            },
        });

        app.setDPContract(dpContract);

        sinon.stub(MNDiscovery.prototype, 'getRandomMasternode')
            .returns(Promise.resolve({ip: '127.0.0.1'}));

        [masterNode] = await startDapi.many(1);

        const seeds = [{ip: masterNode.dapi.container.getIp()}]; //, { ip: master2.dapi.container.getIp()}];
        await masterNode.axeCore.getApi().generate(1500);

        dapiClient = new DAPIClient({
            seeds,
            port: masterNode.dapi.options.getRpcPort(),
        });

        // axe-cli -regtest -rpcuser=axerpc -rpcpassword=password -rpcport=21456 sendtoaddress ygPcCwVy7Fxg7ruxZzqVYdPLtvw7auHAFh 1

        await masterNode.axeCore.getApi().sendToAddress(faucetAddress, 100);
        await dapiClient.generate(20);
        await wait(10000);

    });

    after('cleanup lone services', async () => {
        const instances = [
            masterNode,
        ];

        await Promise.all(instances.filter(i => i)
            .map(i => i.remove()));

        MNDiscovery.prototype.getRandomMasternode.restore();
    });

    describe('Bob', () => {
        it('should register blockchain user', async function it() {
            this.timeout(50000);

            bobPrivateKey = new PrivateKey();
            const validPayload = new Transaction.Payload.SubTxRegisterPayload()
                .setUserName(bobUserName)
                .setPubKeyIdFromPrivateKey(bobPrivateKey).sign(bobPrivateKey);


            let inputs = await dapiClient.getUTXO(faucetAddress);

            const transaction = Transaction()
                .setType(Transaction.TYPES.TRANSACTION_SUBTX_REGISTER)
                .setExtraPayload(validPayload)
                .from(inputs.items.slice(-1)[0])
                .addFundingOutput(10000)
                .change(faucetAddress)
                .sign(faucetPrivateKey);

            bobRegTxId = await dapiClient.sendRawTransaction(transaction.serialize());

            bobPreviousST = bobRegTxId;

            await dapiClient.generate(1);
            await wait(5000);

            // const userByName = await dapiClient.getUserByName(bobUserName); //TODO: client.getuser is not a function
            // expect(userByName.uname).to.be.equal(bobUserName);

        });

        it('should publish "Contacts" contract', async function it() {
            // 1. Create ST packet
            const stPacket = app.packet.create(app.getDPContract());

            // 2. Create State Transition
            const transaction = new Transaction()
                .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

            transaction.extraPayload
                .setRegTxId(bobPreviousST)
                .setHashPrevSubTx(bobPreviousST)
                .setHashSTPacket(stPacket.hash())
                .setCreditFee(1000)
                .sign(bobPrivateKey);

            const transitionHash = await dapiClient.sendRawTransition(
              stPacket.serialize().toString('hex'),
              transaction.serialize(),
            );

            expect(transitionHash).to.be.a('string');
            expect(transitionHash).to.be.not.empty();

            bobPreviousST = transitionHash;

            let dpContract;
            await wait(5000);
            for (let i = 0; i <= attempts; i++) {
                try {
                    // waiting for Contacts to be added
                    dpContract = await dapiClient.fetchDapContract(app.getDPContract().getId());
                    break;
                } catch (e) {
                    await dapiClient.generate(1);
                }
            }

            let expectedContract = JSON.parse(JSON.stringify(app.getDPContract()));
            delete expectedContract['definitions'];
            delete expectedContract['schema'];
            expectedContract.$schema = 'https://schema.axe.org/app-0-4-0/meta/dp-contract';
            expect(dpContract).to.be.deep.equal(expectedContract);
        });

        it('should create profile in "Contacts" app', async function it() {
            app.setUserId(bobRegTxId);

            const user = app.object.create('user', {
                avatarUrl: 'http://test.com/bob.jpg',
                about: 'This is story about me',
            });

            // 1. Create ST profile packet
            const stPacket = app.packet.create([user]);

            // 2. Create State Transition
            const transaction = new Transaction()
                .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

            transaction.extraPayload
                .setRegTxId(bobRegTxId)
                .setHashPrevSubTx(bobPreviousST)
                .setHashSTPacket(stPacket.hash())
                .setCreditFee(1000)
                .sign(bobPrivateKey);

            const transitionHash = await dapiClient.sendRawTransition(
              stPacket.serialize().toString('hex'),
                transaction.serialize(),
            );

            expect(transitionHash).to.be.a('string');
            expect(transitionHash).to.be.not.empty();

            bobPreviousST = transitionHash;

            let users;
            for (let i = 0; i <= attempts; i++) {
                // bobSpace = await dapiClient.fetchDapObjects(dapId, 'user', {});
                users = await dapiClient.fetchDapObjects(
                  app.getDPContract().getId(),
                  'user',
                  {},
                );
                // waiting for Bob's profile to be added
                if (users.length > 0) {
                    break;
                } else {
                    await dapiClient.generate(1);
                }
            }
            expect(users).to.have.lengthOf(1);
            expect(users[0]).to.be.deep.equal(user.toJSON());
        });
    });

    describe('Alice', () => {
        it('should register blockchain user', async function it() {
            this.timeout(50000);

            const seeds = [{ip: masterNode.dapi.container.getIp()}];
            await masterNode.axeCore.getApi().generate(500);

            let count = await masterNode.axeCore.getApi().getBlockCount();

            let result = await masterNode.axeCore.getApi().sendToAddress(faucetAddress, 100);

            await dapiClient.generate(20);

            alicePrivateKey = new PrivateKey();
            const validPayload = new Transaction.Payload.SubTxRegisterPayload()
                .setUserName(aliceUserName)
                .setPubKeyIdFromPrivateKey(alicePrivateKey).sign(alicePrivateKey);

            let inputs = await dapiClient.getUTXO(faucetAddress);
            expect(inputs.items).to.have.lengthOf(2);

            const transaction = Transaction()
                .setType(Transaction.TYPES.TRANSACTION_SUBTX_REGISTER)
                .setExtraPayload(validPayload)
                .from(inputs.items.slice(-1)[0])
                .addFundingOutput(10000)
                .change(faucetAddress)
                .sign(faucetPrivateKey);

            aliceRegTxId = await dapiClient.sendRawTransaction(transaction.serialize());

            alicePreviousST = aliceRegTxId;

            await dapiClient.generate(1);
            await wait(5000);//why we don't generate block and it works?

            // const userByName = await dapiClient.getUserByName(aliceUserName); //TODO
            //expect(userByName.uname).to.be.equal(aliceUserName);
        });

        it('should create profile in "Contacts" app', async function it() {

            app.setUserId(aliceRegTxId);

            aliceUser = app.object.create('user', {
                avatarUrl: 'http://test.com/alice.jpg',
                about: 'I am Alice',
            });

            // 1. Create ST user packet
            const stPacket = app.packet.create([aliceUser]);

            // 2. Create State Transition
            const transaction = new Transaction()
                .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

            transaction.extraPayload
                .setRegTxId(aliceRegTxId)
                .setHashPrevSubTx(alicePreviousST)
                .setHashSTPacket(stPacket.hash())
                .setCreditFee(1000)
                .sign(alicePrivateKey);

            const transitionHash = await dapiClient.sendRawTransition(
              stPacket.serialize().toString('hex'),
                transaction.serialize(),
            );

            expect(transitionHash).to.be.a('string');
            expect(transitionHash).to.be.not.empty();

            alicePreviousST = transitionHash;

            let users;
            for (let i = 0; i <= attempts; i++) {
                // aliceSpace = await dapiClient.fetchDapObjects(dapId, 'user', {});
                users = await dapiClient.fetchDapObjects(
                  app.getDPContract().getId(),
                  'user',
                  {},
                );
                // waiting for Alice's profile to be added
                if (users.length > 1) {
                    break;
                } else {
                    await dapiClient.generate(1);
                }
            }

            expect(users).to.have.lengthOf(2);
            expect(users[1]).to.be.deep.equal(aliceUser.toJSON());
        });

        it('should be able to update her profile', async function it() {
            app.setUserId(aliceRegTxId);

            aliceUser.setAction(DPObject.ACTIONS.UPDATE);
            aliceUser.set('avatarUrl', 'http://test.com/alice2.jpg');

            // 1. Create ST update profile packet
            const stPacket = app.packet.create([aliceUser]);

            // 2. Create State Transition
            const transaction = new Transaction()
                .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

            transaction.extraPayload
                .setRegTxId(aliceRegTxId)
                .setHashPrevSubTx(alicePreviousST)
                .setHashSTPacket(stPacket.hash())
                .setCreditFee(1000)
                .sign(alicePrivateKey);

            const transitionHash = await dapiClient.sendRawTransition(
              stPacket.serialize().toString('hex'),
                transaction.serialize(),
            );

            expect(transitionHash).to.be.a('string');
            expect(transitionHash).to.be.not.empty();

            alicePreviousST = transitionHash;

            let users;
            for (let i = 0; i <= attempts; i++) {
                // aliceSpace = await dapiClient.fetchDapObjects(dapId, 'user', {});
                users = await dapiClient.fetchDapObjects(
                  app.getDPContract().getId(),
                  'user',
                  {},
                );
                // waiting for Alice's profile modified
                if (users.length === 2 && users[1].act === 1) {
                    break;
                } else {
                    await dapiClient.generate(1);
                }
            }

            expect(users).to.have.lengthOf(2);
            expect(users[1]).to.be.deep.equal(aliceUser.toJSON());
        });
    });

    describe('Bob', () => {
        it('should be able to send contact request', async function it() {

            app.setUserId(bobRegTxId);

            const contactRequest = app.object.create('contact', {
                toUserId: aliceRegTxId,
                publicKey: bobPrivateKey.toPublicKey().toString('hex'),
            });

            // 1. Create ST contact request packet
            const stPacket = app.packet.create([contactRequest]);

            // 2. Create State Transition
            const transaction = new Transaction()
                .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

            transaction.extraPayload
                .setRegTxId(bobRegTxId)
                .setHashPrevSubTx(bobPreviousST)
                .setHashSTPacket(stPacket.hash())
                .setCreditFee(1000)
                .sign(bobPrivateKey);

            const transitionHash = await dapiClient.sendRawTransition(
              stPacket.serialize().toString('hex'),
                transaction.serialize(),
            );

            expect(transitionHash).to.be.a('string');
            expect(transitionHash).to.be.not.empty();

            bobPreviousST = transitionHash;

            let contacts;
            for (let i = 0; i <= attempts; i++) {
                contacts = await dapiClient.fetchDapObjects(
                  app.getDPContract().getId(),
                  'contact',
                  {},
                );
                // waiting for Bob's contact request to be added
                if (contacts.length > 0) {
                    break;
                } else {
                    await dapiClient.generate(1);
                }
            }

            expect(contacts).to.have.lengthOf(1);
            expect(contacts[0]).to.be.deep.equal(contactRequest.toJSON());
        });
    });

    describe('Alice', () => {
        it('should be able to approve contact request', async function it() {
            app.setUserId(aliceRegTxId);

            aliceContactAcceptance = app.object.create('contact', {
                toUserId: bobRegTxId,
                publicKey: alicePrivateKey.toPublicKey().toString('hex'),
            });

            // 1. Create ST approve contact packet
            const stPacket = app.packet.create([aliceContactAcceptance]);

            // 2. Create State Transition
            const transaction = new Transaction()
                .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

            transaction.extraPayload
                .setRegTxId(aliceRegTxId)
                .setHashPrevSubTx(alicePreviousST)
                .setHashSTPacket(stPacket.hash())
                .setCreditFee(1000)
                .sign(alicePrivateKey);

            const transitionHash = await dapiClient.sendRawTransition(
              stPacket.serialize().toString('hex'),
                transaction.serialize(),
            );

            expect(transitionHash).to.be.a('string');
            expect(transitionHash).to.be.not.empty();

            alicePreviousST = transitionHash;

            let contacts;
            for (let i = 0; i <= attempts; i++) {
                // aliceContact = await dapiClient.fetchDapObjects(dapId, 'contact', {});
                contacts = await dapiClient.fetchDapObjects(
                  app.getDPContract().getId(),
                  'contact',
                  {},
                );
                // waiting for Bob's contact to be approved from Alice
                if (contacts.length > 1) {
                    break;
                } else {
                    await dapiClient.generate(1);
                }
            }

            expect(contacts).to.have.lengthOf(2);
            expect(contacts[1]).to.be.deep.equal(aliceContactAcceptance.toJSON());
        });

        it('should be able to remove contact approvement', async function it() {
            app.setUserId(aliceRegTxId);

            aliceContactAcceptance.setAction(DPObject.ACTIONS.DELETE);

            // 1. Create ST contact delete packet
            const stPacket = app.packet.create([aliceContactAcceptance]);

            // 2. Create State Transition
            const transaction = new Transaction()
                .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

            transaction.extraPayload
                .setRegTxId(aliceRegTxId)
                .setHashPrevSubTx(alicePreviousST)
                .setHashSTPacket(stPacket.hash())
                .setCreditFee(1000)
                .sign(alicePrivateKey);

            const transitionHash = await dapiClient.sendRawTransition(
              stPacket.serialize().toString('hex'),
                transaction.serialize(),
            );

            expect(transitionHash).to.be.a('string');
            expect(transitionHash).to.be.not.empty();

            alicePreviousST = transitionHash;

            let contacts;
            for (let i = 0; i <= attempts; i++) {
                // waiting for Bob's contact to be deleted from Alice
                // aliceContact = await dapiClient.fetchDapObjects(dapId, 'contact', {});
                contacts = await dapiClient.fetchDapObjects(
                  app.getDPContract().getId(),
                  'contact',
                  {},
                );
                if (contacts.length === 1) {
                    break;
                } else {
                    await dapiClient.generate(1);
                }
            }

            expect(contacts).to.have.lengthOf(1);
            expect(contacts[0]).to.be.deep.equal(aliceContactAcceptance.toJSON());
        });
    });

});
