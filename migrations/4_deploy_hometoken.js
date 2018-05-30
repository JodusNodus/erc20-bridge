const SampleERC20 = artifacts.require("./SampleERC20.sol");

module.exports = function(deployer, network, accounts) {

	const alice = require('../scripts/alice.json').public;

	return deployer.then(function() {
		// Create a new version of A
		return SampleERC20.new({
			from: accounts[0]
		});
	}).then(function(instance) {

		const path = require('path');
		const configfile = path.join(__dirname, '../scripts/bridge-info.json');
		let inputconfig = require(configfile);
		inputconfig = Object.assign(inputconfig, {
			hometoken: {
				address: instance.address,
				network: network,
			},
		});
		var fs = require('fs');
		fs.writeFile(configfile, JSON.stringify(inputconfig,null,4), function(err) {
			if (err) {
				return console.log(err);
			}
		});


		console.log('ERC20 token on main=', instance.address);

		return instance.mint(alice, 1e18, {
			from: accounts[0]
		});

	});
};
