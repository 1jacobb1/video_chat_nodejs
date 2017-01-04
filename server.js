var connect = require('./connect.js'),
	handler = require('./handler.js'),
	util 	= connect.util,
	constant = connect.constant;

/* output debugger for signaling server */
util.log("[SERVER] STARTING SIGNALLING SERVER", "green");
util.log("[HANDLER] INITIALIZE HANDLER", "green");

connect.io.on('connection', function(socket){

	/**
	* connect to room
	* @param data -> configuration of connecting peer
	*/
	socket.on('common.connectToRoom', function(data){
		var obj = {error: false, content: ''};

		util.try(function(resolve, reject){
			/* validation */
			if (typeof data.chatHash === undefined){
				obj.error = true;
				obj.content = "common_connect_to_room_unknown_chat_hash";
				return reject(obj);
			}

			if (typeof data.memberType === undefined){
				obj.error = true;
				obj.content = "common_connect_to_room_unknown_member_type";
				return reject(obj);
			}
			/* end validation */

			switch(data.memberType) {
				case "teacher":
					handler.teacher.registerTeacher({
						data: data
					}, resolve, reject);
					break;
				case "student":
					handler.student.registerStudent({
						data: data
					}, resolve, reject);
					break;
				case "admin":
					resolve();
					break;
				default:
					resolve();
			}

		})
		.then(function(){
			// set socket information
			socket.userData = data;

			// join to room
			socket.join(data.chatHash);
			// inform peers in the room
			socket.broadcast.to(data.chatHash).emit("room.generalCommand", {
				command: "roomConnected",
				content: data
			});

			console.log(connect.chatRooms);

		})
		.catch(function(err){
			obj.error = true;
			obj.content = err;
			util.logError('[ERROR - CONNECTED TO ROOM]: '+err);
		})
		.then(function(){
			return socket.emit('common.connectedToRoom', obj);
		});

	});

	socket.on('room.generalCommand', function(data){
		var obj = {error: false, content: ''};
		util.log("[ROOM.GENERAL_COMMAND] SOCKET: "+JSON.stringify(data), 'white', 'blue');

		if (typeof data.command === undefined || typeof data.content === undefined){
			obj.error = true;
			obj.content = "reason_invalid_general_command";
			return socket.emit('room.generalCommandSent', obj);
		}

		var command = data.command;
		var content = data.content;
		var mode = (typeof data.mode === undefined) ? 'all' : data.mode;

		util.try(function(resolve, reject){
			switch(command){
				case "sendChat":
					resolve();
				case "startLesson":

					break;
				default:
					resolve();
			}

		})
		.then(function(response){
			connect.chatRooms = util.compact(connect.chatRooms);
			if (mode == "to") {
				// broadcast excluding the sender
				socket.broadcast.to(content.chatHash).emit('room.generalCommand', data);
			} else {
				// broadcast including the sender
				connect.io.in(content.chatHash).emit('room.generalCommand', data);
			}

			obj.command = command;
			obj.error = false;
			obj.content = data;
		})
		.catch(function(e){
			obj.error = true;
			obj.content = e;
			util.log("[ROOM.GENERAL_COMMAND] ERROR: "+e);
		})
		.then(function(){
			obj.command = command;
			obj.content = data.content;
			obj.error = obj.error;
			return socket.emit('room.generalCommandSent', obj);
		});

	});


	socket.on('disconnect', function(action){
		util.log('[DISCONNECTION] SOCKET ID: '+ socket.id + ' ACTION -> '+action, 'red');

		var command = "lessonDisconnect";
		var userData = typeof socket.userData !== 'undefined' ? socket.userData : null;

		if (!userData){
			util.log('[DISCONNECTION] USER DATA EMPTY', 'red');
			return false;
		}

		util.log('[DISCONNECTION] USER DATA: '+ JSON.stringify(socket.userData), 'red');

		util.try(function(resolve, reject){
			var memberType = (typeof userData.memberType === 'undefined') ? 'unknown' : userData.memberType;
			var command = "lessonDisconnect";

			if (memberType === "teacher") {
				command = constant.disconnect.teacher.sudden;
				handler.teacher.teacherLeaveRoom({
					data: userData
				}, connect.io, action);
			} else if (memberType === "student") {
				handler.student.studentLeaveRoom({
					data: userData
				}, connect.io, action);
			} else {
				command = "testDeviceSuddenDisconnect";
			}

			// send sudden user disconnection emit
			if (action !== "client namespace disconnect") {
				connect.io.in(userData.chatHash).emit('room.generalCommand', {
					command: command,
					content: userData
				});
			}
			// resolve function
			return resolve(command);
		})
		.then(function(command){
			// output active rooms
			util.outputRooms(connect.chatRooms);
		})
		.catch(function(err){
			util.log('[DISCONNECTION] ERROR: '+err, 'red', 'white');
		})
		.then(function(){
			socket.leave();
		});

	});
});