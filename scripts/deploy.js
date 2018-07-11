const Web3 = require("web3");
const Wallet = require('ethereumjs-wallet');
const hdkey = require('ethereumjs-wallet/hdkey');
const HDWalletProvider = require('truffle-hdwallet-provider')

const SampleERC20 = require("../build/contracts/SampleERC20.json");
const HomeBridge = require("../build/contracts/HomeBridge.json");
const ForeignBridge = require("../build/contracts/ForeignBridge.json");

const requiredValidators = 1;

async function deployERC20(web3, owner, zeroGas=false) {
  const sampleERC20 = await new web3.eth.Contract(SampleERC20.abi, {
    data: SampleERC20.bytecode,
    from: owner,
    gas: 4712388,
    gasPrice: zeroGas ? "0" : 100000000000
  });

  const res = await sampleERC20.deploy().send();
  return res;
}

async function deployHomeBridge(web3, owner, validators) {
  const homeBridge = await new web3.eth.Contract(HomeBridge.abi, {
    data: HomeBridge.bytecode,
    gas: 4712388,
    gasPrice: "10",
    from: owner
  });

  let res = homeBridge.deploy({ arguments: [requiredValidators, validators] });

  res = await res.send({ from: owner });
  console.log("HomeBridge", res._address);
  return res;
}

async function deployForeignBridge(web3, owner, validators) {
  const foreignBridge = await new web3.eth.Contract(ForeignBridge.abi, {
    data: ForeignBridge.bytecode,
    gas: 4712388,
    gasPrice: "10",
    from: owner
  });

  let res = foreignBridge.deploy({ arguments: [requiredValidators, validators] });

  res = await res.send();
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
  const mainWeb3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"));
  const foreignWeb3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"));
  // const foreignWeb3 = new Web3(
  //   new HDWalletProvider(
  //     process.env.ETHEREUM_DEPLOYER_SEED,
  //     "https://mintnet.settlemint.com"
  //   )
  // );

  // Create validator keys
  const seeds = [
    "validator1",
    "validator2",
    "validator3"
  ]
  const validators = seeds
  .map(seedToWallet)
  .map(wallet => wallet.getAddressString())

  const alice = (await mainWeb3.eth.getAccounts())[1];
  const mainOwner = (await mainWeb3.eth.getAccounts())[0];
  const foreignOwner = (await foreignWeb3.eth.getAccounts())[0];

  // for (const to of validators) {
  //   const value = 1e17;
  //   await mainWeb3.eth.sendTransaction({from: mainOwner, to, value});
  //   await foreignWeb3.eth.sendTransaction({from: foreignOwner, to, value});
  // }

  const homeToken = await deployERC20(mainWeb3, mainOwner);
  console.log("Home SampleERC20", homeToken._address);

  await homeToken.methods.mint(alice, 1000).send({ from: mainOwner });
  const balance = await homeToken.methods.balanceOf(alice).call({ from: mainOwner });
  console.log("Home token minted to alice at", alice, "amount:", balance, "DTX")

  const foreignToken = await deployERC20(foreignWeb3, foreignOwner, false);
  console.log("Foreign SampleERC20", foreignToken._address);

  const homeBridge = await deployHomeBridge(mainWeb3, mainOwner, validators);
  const foreignBridge = await deployForeignBridge(foreignWeb3, foreignOwner, validators);

  await registerToken(homeToken, foreignToken, foreignBridge, foreignOwner);
}

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(0);
})