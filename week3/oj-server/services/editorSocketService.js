var redisClient = require('../modules/redisClient');
const TIMEOUT_IN_SECONDS = 3600;

module.exports = function(io) {
	//collaboration sessions
	var collaborations ={};

	//map from socket id to sessionId
	var socketIdToSessionId ={};

	var sessionPath = '/temp_sessions/';

	io.on('connection', (socket) => {
		let sessionId = socket.handshake.query['sessionId'];
		socketIdToSessionId[socket.id] = sessionId;

		//add current socket id to collaboration session participants
		// if (!(sessionId in collaborations)) {
		// 	collaborations[sessionId] = {
		// 		'participants': []
		// 	};
		// }

		if (sessionId in collaborations) {
			//when conneciton is on, check if sessionId is in collaboration
			collaborations[sessionId]['participants'].push(socket.id);
		} else {
			//not in collaboration, check redis
			redisClient.get(sessionPath + sessionId, (data) => {
				//has data
				if (data) {
					console.log('session terminated previously, pulling back from redis');
					collaborations[sessionId] = {
						'participants': [], // we will add the participant later
						'cachedInstructors': JSON.parse(data)
					};
					//add current socket into participants list.
					collaborations[sessionId]['participants'].push(socket.id);
					console.log(collaborations[sessionId]['participants']);
				} else {
					//it does not have data
					//it may be first time created or expired
					//creat new session
					console.log('creating new session');
					collaborations[sessionId] = {
						'participants': [],
						'cachedInstructors': [],
					};
					//add current socket into participants list.
					collaborations[sessionId]['participants'].push(socket.id);
				}
			});
			// bug need to moved to inside
			//add current socket into participants list.
			//collaborations[sessionId]['participants'].push(socket.id);
		}
		//bug  moved to line 39
		//console.log(collaborations[sessionId]['participants']);



		//socket event listeners
		socket.on('change', delta => {
			//change1: bah bah change
			console.log('change' + socketIdToSessionId[socket.id] + ': ' + delta);
			let sessionId = socketIdToSessionId[socket.id];
			if (sessionId in collaborations) {
				collaborations[sessionId]['cachedInstructors'].push(
					["change", delta, Date.now()]);

				let participants = collaborations[sessionId]['participants'];
				for (let i =0; i< participants.length; i++) {
					//only send to other users not include the myself
					if (socket.id != participants[i]) {
						io.to(participants[i]).emit('change', delta);
					}
				}
			} else {
				console.log('warning: could not find the socket id in collaborations');
			}
		});

		//when receive socket restoreBuffer event from client
		socket.on('restoreBuffer', () => {
			//get sessionId means which question you are working on
			let sessionId = socketIdToSessionId[socket.id];
			console.log('restore buffer for session: ' + sessionId + ', socket: ' + socket.id);

			if (sessionId in collaborations) {
				//get the histrory instructions
				let instructions = collaborations[sessionId]['cachedInstructors'];
				//emit change event for every histroy changes
				//so that participant can get the history changes
				for (let i =0; i < instructions.length; i++) {
					//instructions[i][0]: change
					//instructions[i][1]: change value (delta)
					socket.emit(instructions[i][0], instructions[i][1]);
				}

			} else {
				console.log('no collaboration found for this socket');
			}

		});

		//disconnet socket and store data to redis
		socket.on('disconnect', () => {
			let sessionId =socketIdToSessionId[socket.id];
			console.log('disconnect session: ' + sessionId + ', soket: ' + socket.id);
			console.log(collaborations[sessionId]['participants']);

			let foundAndRemove = false;
			if (sessionId in collaborations) {
				//get all participant in the current session
				let participants = collaborations[sessionId]['participants'];
				//get the index of the socket id of the participant
				//which needs to be removed
				let index = participants.indexOf(socket.id);
				//if found that socket id then remove it
				if(index >= 0) {
					//remove participant
					participants.splice(index, 1);
					foundAndRemove = true;
					//then check if this is the last participant
					if (participants.length === 0) {
						console.log('last participant is leaving, commit to redis');
						let key = sessionPath + sessionId;
						let value = JSON.stringify(
							collaborations[sessionId]['cachedInstructors']);
						//store to redis
						redisClient.set(key, value, redisClient.redisPrint);
						//set expire time
						redisClient.expire(key, TIMEOUT_IN_SECONDS);

						delete collaborations[sessionId];
					}
				}
				if (!foundAndRemove) {
					//if reach here debug needed
					console.log("warning : could not find socket.id in collaborations");
				}
			}
		});
	})


	// io.on('connection', (socket) => {
	// 	// console.log(socket);
	// 	// //get handshake message
	// 	// var message = socket.handshake.query['message'];
	// 	// console.log(message);
	// 	// io.to(socket.id).emit('message', 'hehe from server');
	// })
}



