const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");

const DTXToken = require("../build/contracts/DTXToken.json");
const HomeBridge = require("../build/contracts/HomeBridge.json");
const ForeignBridge = require("../build/contracts/ForeignBridge.json");

const config = require("../deploy-config.json");

async function sendWithEstimateGas(call, owner, web3) {
  const gasEstimate = await call.estimateGas();
  const txCount = await web3.eth.getTransactionCount(owner);
  return await call.send({ gas: Math.ceil(gasEstimate * 1.5), owner, none: txCount });
}

async function deployERC20(web3, owner, gasPrice) {
  const sampleERC20 = await new web3.eth.Contract(DTXToken.abi, {
    data: DTXToken.bytecode,
    from: owner,
    gasPrice
  });

  return sendWithEstimateGas(sampleERC20.deploy({
    arguments: [0x0]
  }), owner, web3);
}

async function deployHomeBridge(web3, owner, validators, gasPrice) {
  const homeBridge = await new web3.eth.Contract(HomeBridge.abi, {
    data: HomeBridge.bytecode,
    gasPrice,
    from: owner
  });

  const call = homeBridge.deploy({
    arguments: [config.requiredValidators, validators]
  });
  const res = await sendWithEstimateGas(call, owner, web3);

  console.log("HomeBridge", res._address);
  return res;
}

async function deployForeignBridge(web3, owner, validators, gasPrice) {
  const foreignBridge = await new web3.eth.Contract(ForeignBridge.abi, {
    data: ForeignBridge.bytecode,
    gasPrice,
    from: owner
  });

  const call = foreignBridge.deploy({
    arguments: [config.requiredValidators, validators]
  });
  const res = await sendWithEstimateGas(call, owner, web3);

  console.log("ForeignBridge", res._address);
  return res;
}

async function registerToken(homeToken, foreignToken, foreignBridge, owner, web3) {
  let call;

  // The bridge must have ownership of the foreign token
  call = await foreignToken.methods.changeController(foreignBridge._address);
  await sendWithEstimateGas(call, owner, web3);

  console.log("Foreign DTX controller set");

  call = await foreignBridge.methods.registerToken(
    homeToken._address,
    foreignToken._address
  );
  await sendWithEstimateGas(call, owner, web3);

  console.log("Token registered");
}

function seedToAddress(seed) {
  const provider = new HDWalletProvider(seed);
  return provider.getAddresses()[0];
}

const configToWeb3 = ({ seed, url }) => {
  return new Web3(new HDWalletProvider(seed, url));
};

async function main() {
  const homeWeb3 = configToWeb3(config.providers.home);
  const foreignWeb3 = configToWeb3(config.providers.foreign);

  const [homeGasPrice, foreignGasPrice] = await Promise.all([
    homeWeb3.eth.getGasPrice(),
    foreignWeb3.eth.getGasPrice()
  ]);

  // Create validator keys from provided seeds
  const validators = config.validatorSeeds.map(seedToAddress);

  // Owners of bridge contracts
  const homeOwner = (await homeWeb3.eth.getAccounts())[0];
  const foreignOwner = (await foreignWeb3.eth.getAccounts())[0];

  console.log("Home owner", homeOwner);
  console.log("Foreign owner", foreignOwner);
  console.log("Validators", validators);

  const homeToken = await deployERC20(homeWeb3, homeOwner, homeGasPrice);
  console.log("Home DTXToken", homeToken._address);

  if (config.testAccountSeed) {
    const addr = seedToAddress(config.testAccountSeed);
    await homeToken.methods.generateTokens(addr, 10000000).send({ from: homeOwner });
  }

  const foreignToken = await deployERC20(
    foreignWeb3,
    foreignOwner,
    foreignGasPrice
  );
  console.log("Foreign DTXToken", foreignToken._address);

  const homeBridge = await deployHomeBridge(
    homeWeb3,
    homeOwner,
    validators,
    homeGasPrice
  );
  const foreignBridge = await deployForeignBridge(
    foreignWeb3,
    foreignOwner,
    validators,
    foreignGasPrice
  );

  await registerToken(homeToken, foreignToken, foreignBridge, foreignOwner, foreignWeb3);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(0);
  });
