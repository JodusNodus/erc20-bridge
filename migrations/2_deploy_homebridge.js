const HomeERC20Bridge = artifacts.require("./HomeERC20Bridge.sol");

module.exports = function(deployer, network, accounts) {

	const validators = [
		require('../scripts/w1.json').public,
		require('../scripts/w2.json').public,
		require('../scripts/w3.json').public,
	];

	console.log('validators', validators);

	return deployer.deploy(HomeERC20Bridge, 3, validators, {
		from: accounts[0]
	}).then(() => {
		console.log('deployed. Instance',HomeERC20Bridge.address);

		let inputconfig = {
			homebridge: {
				address: HomeERC20Bridge.address,
				network: network,
			},
		};

		const path = require('path');
		const outputconfigfile = path.join(__dirname, '../scripts/bridge-info.json');
		var fs = require('fs');
		fs.writeFile(outputconfigfile, JSON.stringify(inputconfig,null,4), function(err) {
			if (err) {
				return console.log(err);
			}
		});
	});
};
