const ganache = require("ganache-cli");
const config = require("../deploy-config.json");
const HDWalletProvider = require('truffle-hdwallet-provider')

const seedToPrivateKey = (seed) => {
  const provider = new HDWalletProvider(seed)
  return '0x' + provider.hdwallet._hdkey._privateKey.toString("hex");
}

const seedToAccountBalance = (seed) => ({
  secretKey: seedToPrivateKey(seed),
  balance: 0x2386F26FC10000
})


const serverConf = {
  accounts: [
    seedToAccountBalance(config.testAccountSeed),
    seedToAccountBalance(config.providers.home.seed),
    seedToAccountBalance(config.providers.foreign.seed),
    ...config.validatorSeeds.map(seedToAccountBalance)
  ],
  logger: console
}

const server = ganache.server(serverConf);


server.listen(8545, function (err, blockchain) {

});