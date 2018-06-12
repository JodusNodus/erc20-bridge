const w1 = require('./w1.json');
const w2 = require('./w2.json');
const w3 = require('./w3.json');
const bridge = require('./bridge-info.json');

const endpoint = 'ws://localhost:8548';

console.log('node bin.js --mainweb3hostws ' + endpoint +
	' --foreignweb3hostws ' + endpoint +
	' --maincontractaddress ' + bridge.homebridge.address +
	' --foreigncontractaddress ' + bridge.foreignbridge.address +
	' --startblockmain 3416125 ' +
	' --startblockforeign 3416125 ' +
	'--pollinterval 2000 --keyfile ../../erc20-bridge/scripts/w1.json'
);
