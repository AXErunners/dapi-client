const axeQuorums = require('@axerunners/quorums');
const MNDiscoveryService = require('./MNDiscovery/index');
const { block: blockApi } = require('./index');

const QuorumService = {
  async getQuorumForUser(userRegTxId) {
    const bestBlockHeight = await blockApi.getBestBlockHeight();
    const refHeight = axeQuorums.getRefHeight(bestBlockHeight);
    const refBlockHash = await blockApi.getBlockHash(refHeight);
    const MNList = MNDiscoveryService.getMNList();
    return axeQuorums.getQuorum(MNList, refBlockHash, userRegTxId);
  },
};

module.exports = QuorumService;
