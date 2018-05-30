const w1 = require('./w1.json');
const w2 = require('./w2.json');
const w3 = require('./w3.json');
const bridge = require('./bridge-info.json');

const endpoint = 'wss://ropsten.infura.io/ws';

console.log('node bin.js --mainweb3hostws ' + endpoint 
	+ ' --foreignweb3hostws '+ endpoint
	+ ' --maincontractaddress ' + bridge.homebridge.address
	+ ' --foreigncontractaddress ' + bridge.foreignbridge.address
	+ ' --startblock 3340495');


//console.log('3,["' + w1.public + '","' + w2.public + '","' + w3.public + '"]');
