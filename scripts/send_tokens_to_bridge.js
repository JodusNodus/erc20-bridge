const SampleERC20 = artifacts.require("./SampleERC20.sol");

module.exports = function(callback) {

	const Web3 = require('web3');

	//const ethUtil = require("ethereumjs-util");
	const EthereumTx = require("ethereumjs-tx");

	const PrivateKeyProvider = require("truffle-privatekey-provider");

	const path = require('path');
	const configfile = path.join(__dirname, 'bridge-info.json');
	const inputconfig = require(configfile);
	const alice = require('./alice.json');

	// let p = new PrivateKeyProvider(alice.private, "https://ropsten.infura.io/U8U4n8mm2wDgB2e3Dksv");
	// SampleERC20.web3.setProvider(p);

	// console.log('Web3', SampleERC20.Web3);
	// console.log('web3', SampleERC20.web3);

	// SampleERC20.at(inputconfig.hometoken.address).transfer(inputconfig.homebridge.address, 1, {
	// 	from: alice.public
	// });
	//	process.exit();

	//let tempweb3 = new Web3(new PrivateKeyProvider(alice.private, "https://ropsten.infura.io/U8U4n8mm2wDgB2e3Dksv"));
	let tempweb3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/U8U4n8mm2wDgB2e3Dksv"));
	homeToken = new tempweb3.eth.Contract(SampleERC20.abi, inputconfig.hometoken.address);

	let data = homeToken.methods.transfer(inputconfig.homebridge.address, 1).encodeABI();

	const privateKey = Buffer.from(alice.private, 'hex');


	tempweb3.eth.getTransactionCount(alice.public).then((nonce) => {
		const txParams = {
			to: inputconfig.hometoken.address,
			data: data,
			gas: 150000,
			gasPrice: 1e9,
			from: alice.public,
			nonce: nonce,
		};

		console.log(txParams);

		const tx = new EthereumTx(txParams);
		tx.sign(privateKey);
		const serializedTx = tx.serialize();

		console.log('serializedTx', serializedTx.toString('hex'));

		tempweb3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, tx) {
			if (err) {
				console.log(err);
			} else {
				console.log('tx', tx);
			}

		});
	});


};
//
