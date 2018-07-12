const Web3 = require("web3");
const Wallet = require('ethereumjs-wallet');
const hdkey = require('ethereumjs-wallet/hdkey');
const HDWalletProvider = require('truffle-hdwallet-provider')

const SampleERC20 = require("../build/contracts/SampleERC20.json");
const HomeBridge = require("../build/contracts/HomeBridge.json");
const ForeignBridge = require("../build/contracts/ForeignBridge.json");

const options = {
  requiredValidators: 1,
  seeds: ["validator1", "validator2", "validator3"],
  providers: {
    home: new HDWalletProvider(
      "this is a real seed",
      "http://localhost:7545"
    ),
    foreign: new HDWalletProvider(
      "this is a real seed",
      "https://mintnet.settlemint.com"
    )
  },
  gasPrice: {
    home: "10",
    foreign: "0"
  }
};

async function deployERC20(web3, owner, gasPrice) {
  const sampleERC20 = await new web3.eth.Contract(SampleERC20.abi, {
    data: SampleERC20.bytecode,
    from: owner,
    gas: 4712388,
    gasPrice
  });

  const res = await sampleERC20.deploy().send();
  return res;
}

async function deployHomeBridge(web3, owner, validators) {
  const homeBridge = await new web3.eth.Contract(HomeBridge.abi, {
    data: HomeBridge.bytecode,
    gas: 4712388,
    gasPrice: options.gasPrice.home,
    from: owner
  });

  const res = await homeBridge
    .deploy({ arguments: [options.requiredValidators, validators] })
    .send({ from: owner });

  console.log("HomeBridge", res._address);
  return res;
}

async function deployForeignBridge(web3, owner, validators) {
  const foreignBridge = await new web3.eth.Contract(ForeignBridge.abi, {
    data: ForeignBridge.bytecode,
    gas: 4712388,
    gasPrice: options.gasPrice.foreign,
    from: owner
  });

  const res = await foreignBridge
    .deploy({ arguments: [options.requiredValidators, validators] })
    .send({ from: owner });

  console.log("ForeignBridge", res._address);
  return res;
}

async function registerToken(homeToken, foreignToken, foreignBridge, owner) {
  // The bridge must have ownership of the foreign token
  await foreignToken.methods.transferOwnership(foreignBridge._address).send({ from: owner });

  await foreignBridge.methods.registerToken(homeToken._address, foreignToken._address).send({ from: owner });
  console.log("Token registered");
}

function seedToWallet(seed) {
  const privateKey = hdkey.fromMasterSeed(seed)._hdkey._privateKey;
  return Wallet.fromPrivateKey(privateKey);
}

async function main() {
  const homeWeb3 = new Web3(options.providers.home);
  const foreignWeb3 = new Web3(options.providers.foreign);

  // Create validator keys
  const validators = options.seeds
  .map(seedToWallet)
  .map(wallet => wallet.getAddressString())

  const alice = (await homeWeb3.eth.getAccounts())[0];
  const homeOwner = (await homeWeb3.eth.getAccounts())[0];
  const foreignOwner = (await foreignWeb3.eth.getAccounts())[0];

  const homeToken = await deployERC20(homeWeb3, homeOwner, options.gasPrice.home);
  console.log("Home SampleERC20", homeToken._address);

  const foreignToken = await deployERC20(foreignWeb3, foreignOwner, options.gasPrice.foreign);
  console.log("Foreign SampleERC20", foreignToken._address);

  const homeBridge = await deployHomeBridge(homeWeb3, homeOwner, validators);
  const foreignBridge = await deployForeignBridge(foreignWeb3, foreignOwner, validators);

  await registerToken(homeToken, foreignToken, foreignBridge, foreignOwner);
}

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(0);
})