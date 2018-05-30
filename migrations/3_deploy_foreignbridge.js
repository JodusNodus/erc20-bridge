var ForeignERC777Bridge = artifacts.require("./ForeignERC777Bridge.sol");

module.exports = function(deployer, network, accounts) {

	const validators = [
		require('../scripts/w1.json').public,
		require('../scripts/w2.json').public,
		require('../scripts/w3.json').public,
	];

	console.log('validators', validators);

	return deployer.deploy(ForeignERC777Bridge, 3, validators, {
		from: accounts[0]
	}).then(() => {
		const path = require('path');
		const configfile = path.join(__dirname, '../scripts/bridge-info.json');
		let inputconfig = require(configfile);
		inputconfig = Object.assign(inputconfig, {
			foreignbridge: {
				address: ForeignERC777Bridge.address,
				network: network,
			},
		});
		var fs = require('fs');
		fs.writeFile(configfile, JSON.stringify(inputconfig,null,4), function(err) {
			if (err) {
				return console.log(err);
			}
		});
	});
};
