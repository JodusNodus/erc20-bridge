const Web3 = require("web3");
const Wallet = require('ethereumjs-wallet');
const hdkey = require('ethereumjs-wallet/hdkey');
const PrivateKeyProvider = require('truffle-privatekey-provider')
const bip39 = require('bip39')

const SampleERC20 = require("../build/contracts/SampleERC20.json");
const HomeBridge = require("../build/contracts/HomeBridge.json");
const ForeignBridge = require("../build/contracts/ForeignBridge.json");

const config = require("../deploy-config.json");

async function sendWithEstimateGas (call, owner) {
  const gasEstimate = await call.estimateGas();
  return await call.send({ gas: Math.ceil(gasEstimate * 1.5), owner });
}

async function deployERC20(web3, owner, gasPrice) {
  const sampleERC20 = await new web3.eth.Contract(SampleERC20.abi, {
    data: SampleERC20.bytecode,
    from: owner,
    gasPrice
  });

  return sendWithEstimateGas(sampleERC20.deploy());
}

async function deployHomeBridge(web3, owner, validators, gasPrice) {
  const homeBridge = await new web3.eth.Contract(HomeBridge.abi, {
    data: HomeBridge.bytecode,
    gasPrice,
    from: owner
  });

  const call = homeBridge.deploy({ arguments: [config.requiredValidators, validators] });
  const res = await sendWithEstimateGas(call);

  console.log("HomeBridge", res._address);
  return res;
}

async function deployForeignBridge(web3, owner, validators, gasPrice) {
  const foreignBridge = await new web3.eth.Contract(ForeignBridge.abi, {
    data: ForeignBridge.bytecode,
    gasPrice,
    from: owner
  });

  const call = foreignBridge.deploy({ arguments: [config.requiredValidators, validators] });
  const res = await sendWithEstimateGas(call);

  console.log("ForeignBridge", res._address);
  return res;
}

async function registerToken(homeToken, foreignToken, foreignBridge, owner) {
  let call;

  // The bridge must have ownership of the foreign token
  call = await foreignToken.methods.transferOwnership(foreignBridge._address);
  await sendWithEstimateGas(call, owner);

  call = await foreignBridge.methods.registerToken(homeToken._address, foreignToken._address);
  await sendWithEstimateGas(call, owner);

  console.log("Token registered");
}

function seedToWallet(seed) {
  seed = bip39.mnemonicToSeed(seed);
  const privateKey = hdkey.fromMasterSeed(seed)._hdkey._privateKey;
  return Wallet.fromPrivateKey(privateKey);
}

const configToWeb3 = ({ seed, url }) => {
  const privateKey = seedToWallet(seed).getPrivateKeyString().slice(2);
  return new Web3(new PrivateKeyProvider(privateKey, url));
}

async function main() {
  const homeWeb3 = configToWeb3(config.providers.home);
  const foreignWeb3 = configToWeb3(config.providers.foreign);

  const [homeGasPrice, foreignGasPrice] = await Promise.all([
    homeWeb3.eth.getGasPrice(),
    foreignWeb3.eth.getGasPrice()
  ]);

  // Create validator keys from provided seeds
  const validators = config.validatorSeeds
  .map(seedToWallet)
  .map(wallet => wallet.getAddressString())

  // Owners of bridge contracts
  const homeOwner = (await homeWeb3.eth.getAccounts())[0];
  const foreignOwner = (await foreignWeb3.eth.getAccounts())[0];

  console.log("Home owner", homeOwner);
  console.log("Foreign owner", foreignOwner);
  console.log("Validators", validators);

  const homeToken = await deployERC20(homeWeb3, homeOwner, homeGasPrice);
  console.log("Home SampleERC20", homeToken._address);

  const foreignToken = await deployERC20(foreignWeb3, foreignOwner, foreignGasPrice);
  console.log("Foreign SampleERC20", foreignToken._address);

  const homeBridge = await deployHomeBridge(homeWeb3, homeOwner, validators, homeGasPrice);
  const foreignBridge = await deployForeignBridge(foreignWeb3, foreignOwner, validators, foreignGasPrice);

  await registerToken(homeToken, foreignToken, foreignBridge, foreignOwner);
}

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(0);
})