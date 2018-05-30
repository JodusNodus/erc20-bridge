const PrivateKeyProvider = require("truffle-privatekey-provider");
const fs = require('fs');
const path = require('path');
const ownerfilename = path.join(__dirname, 'scripts/owner.json');

function getNetworks() {
	var ownerAccount = null;
	if (fs.existsSync(ownerfilename)) {
		ownerAccount = require(ownerfilename);
	}
	if (!ownerAccount){
		console.error('please run scripts/mkaccounts.sh to create a set of keys for all actors of the bridge');
		console.error('No owner account found. Bailing out');
		process.exit();
	}
	const networks = {
		development: {
			host: "localhost",
			port: 8545,
			network_id: "*" // Match any network id
		},
		ropsten: {
			provider: ownerAccount ? new PrivateKeyProvider(ownerAccount.private, "https://ropsten.infura.io/U8U4n8mm2wDgB2e3Dksv") : null,
			network_id: 3,
			//gas: 1828127,
			myvar: 123,
		},
		mainnet: {
			provider: ownerAccount ? new PrivateKeyProvider(ownerAccount.private, "https://mainnet.infura.io/U8U4n8mm2wDgB2e3Dksv") : null,
			network_id: 1,
			//gas: 1828127,
		},
	    coverage: {
	      host: "localhost",
	      network_id: "*",
	      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
	      gas: 0xfffffffffff, // <-- Use this high gas value
	      gasPrice: 0x01      // <-- Use this low gas price
	    },
	};
	return(networks);
}

module.exports = {
	networks: getNetworks(),
	solc: {
		optimizer: {
			enabled: true,
			runs: 200
		}
	},
};
