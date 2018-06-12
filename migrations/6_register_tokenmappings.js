var ForeignERC777Bridge = artifacts.require("./ForeignERC777Bridge.sol");

module.exports = function(deployer, network, accounts) {

	const path = require('path');
	const configfile = path.join(__dirname, '../scripts/bridge-info.json');
	let inputconfig = require(configfile);

	return ForeignERC777Bridge.deployed().then((foreignBridge) => {

//		return foreignBridge.registerToken(inputconfig.hometoken.address, inputconfig.foreigntoken.address, {
		return foreignBridge.registerToken(inputconfig.hometoken.address, {
			from: accounts[0],
		}).then(() => {
			console.log('created tokenmapping', inputconfig.hometoken.address, '=>', inputconfig.foreigntoken.address)
		});
	});
};
