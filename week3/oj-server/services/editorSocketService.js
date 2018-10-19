module.exports = function(io) {
	//collaboration sessions
	var collaborations ={};

	//map from socket id to sessionId
	var socketIdToSessionId ={};

	io.on('connection', (socket) => {
		let sessionId = socket.handshake.query['sessionId'];
		socketIdToSessionId[socket.id] = sessionId;

		//add current socket id to collaboration session participants
		if (!(sessionId in collaborations)) {
			collaborations[sessionId] = {
				'participants': []
			};
		}
		collaborations[sessionId]['participants'].push(socket.id);

		//socket event listeners
		socket.on('change', delta => {
			//change1: bah bah change
			console.log('change' + socketIdToSessionId[socket.id] + ': ' + delta);
			let sessionId = socketIdToSessionId[socket.id];
			if (sessionId in collaborations) {
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
		})
	})


	// io.on('connection', (socket) => {
	// 	// console.log(socket);
	// 	// //get handshake message
	// 	// var message = socket.handshake.query['message'];
	// 	// console.log(message);
	// 	// io.to(socket.id).emit('message', 'hehe from server');
	// })
}



