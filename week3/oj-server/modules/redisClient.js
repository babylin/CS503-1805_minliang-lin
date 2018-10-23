var redis = require('redis');
//only one client is created
var client = redis.createClient();

//we only call set to store data to redis.
function set(key, value, callback) {
	client.set(key, value, (err, res) => {
		if(err) {
			console.log(err);
			return;
		}
		callback(res);
	})
}

function get(key, callback) {
	client.get(key, (err, res) => {
		if (err) {
			console.log(err);
			return;
		}
		callback(res);
	})
}

// only store the keys in timeInSeconds seconds
// once expired, keys will be deleted.
// since the cache is limited and may not be synchonoused with
// database, data only valid during a period of time

function expire(key, timeInSeconds) {
	client.expire(key, timeInSeconds);
}

function quit(){
	client.quit();
}

module.exports = {
	get: get,
	set: set,
	expire: expire,
	quit: quit,
	redisPrint: redis.print
}