var client = require('./rpc_client');

client.add(1, 2, function(result) {
	console.assert(result == 3);
});