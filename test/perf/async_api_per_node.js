require('../bootstrap');

const path = require('path');

const sinon = require('sinon');

const AxePlatformProtocol = require('@axerunners/dpp');
const entropy = require('@axerunners/dpp/lib/util/entropy');

const {
    Transaction,
    PrivateKey,
} = require('@axerunners/axecore-lib');

const wait = require('../utils/wait');
const MNDiscovery = require('../../src/MNDiscovery/index');

const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

require('dotenv').config({path: path.resolve(__dirname, '.env')});


const DAPIClient = require('../../src/index');

describe("Performance", function () {
    const timeoutTest = 320000;
    const numRequests = 100;
    const numPartRequests = 30; // for getUTXO requests
    const numLoops = 5;
    const faucetAddress = process.env.faucetAddress;
    const privKey = process.env.privKey;
    const faucetPrivateKey = new PrivateKey(privKey);
    let dpp;
    let dapiClient;


    before("set dapi node", function () {

        const seeds = [{service: process.env.DAPI_IP}];
        sinon.stub(MNDiscovery.prototype, 'getRandomMasternode')
            .returns(Promise.resolve({service: process.env.DAPI_IP}));
        dapiClient = new DAPIClient({seeds, port: 3000});
        spy = sinon.spy(dapiClient, 'makeRequestToRandomDAPINode');
        dpp = new AxePlatformProtocol();
    });


    beforeEach(async () => {
        spy.resetHistory();
        // wait when dapi restored after any crashes ( getUTXO for example)
        await wait(20000);
    });

    after(() => {
        spy.restore();
    });

    async function runPromise(queries) {
        const start = new Date();
        return await Promise.all(queries)
            .then(result => {
                const delta = new Date() - start;
                console.log(delta);
                return {time: delta, result: result};
            })
            .catch(err => {
                console.log(err);
                return Promise.reject(err)
            });
    }

    describe('Address', () => {
        // https://axepay.atlassian.net/browse/EV-1208 dapi&axed crashed on devnet with 20 async getUTXO requests
        it("getUTXO", async function it() {
            this.timeout(timeoutTest * 2);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numPartRequests);
                for (let index = 0; index < numPartRequests; ++index) {
                    queries[index] = dapiClient.getUTXO(faucetAddress);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numPartRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);
        });

        it("getAddressSummary", async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getAddressSummary(faucetAddress);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

        it("getAddressUnconfirmedBalance", async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getAddressUnconfirmedBalance(faucetAddress);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

        it("getAddressTotalReceived", async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getAddressTotalReceived(faucetAddress);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);
        });

        it("getAddressTotalSent", async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getAddressTotalSent(faucetAddress);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

        it("getTransactionsByAddress", async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getTransactionsByAddress(faucetAddress);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);
        });
    });

    describe('Block', () => {
        it("getBestBlockHeight", async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getBestBlockHeight();

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);
        });

        it("getBlockHash", async function it() {
            this.timeout(timeoutTest);
            const height = await dapiClient.getBestBlockHeight();
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getBlockHash(height);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests + 1);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

        it("getBlockHeaders", async function it() {
            this.timeout(timeoutTest);
            const height = await dapiClient.getBestBlockHeight();
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getBlockHeaders(height, 3);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests + 1);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

        it("getBlocks", async function it() {
            this.timeout(timeoutTest);
            const today = new Date().toISOString().substring(0, 10);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getBlocks(today, 1);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

        // https://axepay.atlassian.net/browse/EV-1207 dapi-client: getRawBlock kills insight-api
        it("getRawBlock", async function it() {
            this.timeout(timeoutTest);
            const height = await dapiClient.getBestBlockHeight();
            const blockHash = await dapiClient.getBlockHash(height);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getRawBlock(blockHash);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests + 2);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

        it("getHistoricBlockchainDataSyncStatus", async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getHistoricBlockchainDataSyncStatus();

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

    });

    describe('Transaction', () => {
        it("getTransaction", async function it() {
            this.timeout(timeoutTest);
            const trxs = await dapiClient.getTransactionsByAddress(faucetAddress);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getTransaction(trxs.items[i % trxs.items.length].txid);
                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests + 1);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

        it("getTransactionById", async function it() {
            this.timeout(timeoutTest);
            const trxs = await dapiClient.getTransactionsByAddress(faucetAddress);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getTransactionById(trxs.items[i % trxs.items.length].txid);
                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests + 1);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);
        });
    });

    describe('All APIs', () => {
        let bobPrivateKeys = [];
        let bobUserNames = [];
        let bobUserIds = [];
        let bobRegTxIds = [];
        let dapIds = [];
        // const seeds = [{ip: '52.39.47.232'}];

        it('sendRawTransaction', async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const inputs = await dapiClient.getUTXO(faucetAddress);
                const queries = new Array(1);
                const bobUserName = Math.random().toString(36).substring(7);
                const bobPrivateKey = new PrivateKey();
                for (let index = 0; index < 1; ++index) {

                    const validPayload = new Transaction.Payload.SubTxRegisterPayload()
                        .setUserName(bobUserName)
                        .setPubKeyIdFromPrivateKey(bobPrivateKey).sign(bobPrivateKey);

                    const transaction = Transaction()
                        .setType(Transaction.TYPES.TRANSACTION_SUBTX_REGISTER)
                        .setExtraPayload(validPayload)
                        .from(inputs.slice(-1)[0])
                        .addFundingOutput(10000)
                        .change(faucetAddress)
                        .sign(faucetPrivateKey);

                    queries[index] = dapiClient.sendRawTransaction(transaction.serialize());

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                    bobPrivateKeys.push(bobPrivateKey);
                    bobUserNames.push(bobUserName);
                    bobRegTxIds = bobRegTxIds.concat(result.result.map(function (item) {
                        return item.txid
                    }));
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * 2);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

        it('estimateFee', async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.estimateFee(Math.floor(Math.random() * 100) + 1);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);
        });

        it('getUserByName', async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getUserByName(bobUserNames[Math.floor(Math.random() * bobUserNames.length)]);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                    bobUserIds = bobUserIds.concat(result.result.map(function (item) {
                        return item.regtxid
                    }));
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);
        });

        it('getUserById', async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.getUserById(bobUserIds[Math.floor(Math.random() * bobUserIds.length)]);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);
        });


        it('sendRawTransition', async function it() {
            this.timeout(timeoutTest);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const contract = dpp.contract.create(entropy.generate().substr(0, 24), {
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

                dpp.setContract(contract);

                const queries = new Array(1);
                expect(bobRegTxIds).to.have.lengthOf.above(0);
                for (let index = 0; index < 1; ++index) {

                    const stPacket = dpp.packet.create(dpp.getContract());

                    // 2. Create State Transition
                    const transaction = new Transaction()
                        .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

                    transaction.extraPayload
                        .setRegTxId(bobRegTxIds[i])
                        .setHashPrevSubTx(bobRegTxIds[i])
                        .setHashSTPacket(stPacket.hash())
                        .setCreditFee(1000)
                        .sign(bobPrivateKeys[i]);

                    queries[index] = await dapiClient.sendRawTransition(
                      transaction.serialize(),
                      stPacket.serialize().toString('hex')
                    );
                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                    dapIds.push(doubleSha256(Schema.serialize.encode(contract.dapcontract)));
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);
        });

        it('fetchContract', async function it() {
            this.timeout(timeoutTest * 2);
            expect(dapIds).to.have.lengthOf.above(0);
            for (let i = 0; i <= 240; i++) {
                try {
                    // waiting for Contacts to be added
                    await dapiClient.fetchContract(dapIds[0]);
                    break;
                } catch (e) {
                    await wait(1000);
                }
            }
            spy.resetHistory();
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.fetchContract(dapIds[Math.floor(Math.random() * dapIds.length)]);

                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);

        });

        it('fetchDocuments', async function it() {
            this.timeout(timeoutTest);
            expect(dapIds).to.have.lengthOf.above(0);
            let results = [];
            for (var i = 0; i < numLoops; i += 1) {
                const queries = new Array(numRequests);
                for (let index = 0; index < numRequests; ++index) {
                    queries[index] = dapiClient.fetchDocuments(dapIds[Math.floor(Math.random() * dapIds.length)], 'user', {});
                }
                await runPromise(queries).then(function (result) {
                    results.push(result.time);
                }, function (failure) {
                    expect(failure, 'Errors found').to.be.undefined;
                });
            }
            expect(spy.callCount).to.be.equal(numLoops * numRequests);
            expect(results).to.have.lengthOf(numLoops);
            const result = average(results);
            expect(result).to.not.be.NaN;
            expect(result).to.be.a('number');
            console.log("average:", result);
        });

    });
});
