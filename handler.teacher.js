var connect 	= require('./connect.js'),
	util		= connect.util,
	model		= require('./model.js'),
	constant	= connect.constant;

module.exports = {

	registerTeacher: function(obj, resolve, reject){
		if (typeof obj === undefined || typeof obj.data === undefined){
			return reject("handler_teacher_invalid_register_teacher_params");
		}

		var data = obj.data;

		var chatRoomIdx = util.getIndex(connect.chatRooms, {room: data.chatHash});
		util.log('[TEACHER_CONNECT] CHECK IF ROOM ALREADY EXISTS, INDEX -> '+chatRoomIdx, 'yellow');

		if (chatRoomIdx <= -1){
			util.log('[TEACHER_CONNECT] ADDING NEW ROOM');
			connect.chatRooms.push({
				room: data.chatHash,
				teacher: parseInt(data.teacherId),
				created: util.currentTime(),
				teacherDisconnect: false
			});
		} else {
			if (typeof connect.chatRooms[chatRoomIdx].teacher !== 'undefined' && connect.chatRooms[chatRoomIdx].teacher !== null){
				util.log('[TEACHER_CONNECT] ROOM ALREADY OCCUPIED', 'red');
				return reject('room_already_occupied');
			}

			if (typeof connect.chatRooms[chatRoomIdx].teacherDisconnect !== 'undefined' && connect.chatRooms[chatRoomIdx].teacherDisconnect !== null){
				clearTimeout(connect.chatRooms[chatRoomIdx].teacherDisconnect);
				util.log('[TEACHER_CONNECT] CLEAR TIMEOUT FOR TEACHER DISCONNECTION', 'green');
			}

			connect.chatRooms[chatRoomIdx].teacher = parseInt(data.teacherId);
			connect.chatRooms[chatRoomIdx].teacherDisconnect = false;
			util.log('[TEACHER_CONNECT] APPLIED TEACHER INDEX', 'green');
		}

		model.updateLessonOnAir(
			{connect_flag: 1},
			{
				where: {chat_hash: data.chatHash}
			}
		)
		.then(function(onAirs){
			util.log('[TEACHER_CONNECT] UPDATE CONNECT_FLAG TO 1', 'green');
			return resolve();
		})
		.catch(function(err){
			return reject(err);
		});
	},

	teacherLeaveRoom: function(obj, socket, disconnection){
		if (typeof obj.data === undefined){
			return reject('handler_teacher_invalid_teacher_leave_room_params');
		}
console.log(connect.chatRooms);
		var data = obj.data;
		var element = this;

		var chatRoomIdx = util.getIndex(connect.chatRooms, {room: data.chatHash});
		util.log('[TEACHER_LEAVE_ROOM] CHECK IF ROOM IS EXISTING INDEX -> '+chatRoomIdx, 'yellow');

		if (chatRoomIdx > -1){
			util.log('[TEACHER_LEAVE_ROOM] REMOVE TEACHER FROM ROOM');
			connect.chatRooms[chatRoomIdx].teacher = null;
		}

		if (chatRoomIdx > -1 &&
			typeof connect.chatRooms[chatRoomIdx].teacherDisconnect !== "undefined" &&
			connect.chatRooms[chatRoomIdx].teacherDisconnect === false &&
			disconnection !== "client namespace disconnect"
		) {
			util.log('[TEACHER_LEAVE_ROOM] SETTNG TIMEOUT FOR TEACHER DISCONNECTION -> '+connect.chatRooms[chatRoomIdx].teacherDisconnect, 'yellow');
			
			/* declare timeout disconnection */
			connect.chatRooms[chatRoomIdx].teacherDisconnect = setTimeout(function(){

				/* attempt automatic disconnection of teacher */
				util.try(function(resolve, reject){
					if (typeof element.disconnectTeacher === 'function') { element.disconnectTeacher(obj,resolve,reject); }
				})
				.then(function(){
					console.log(connect.chatRooms);
					return socket.in(data.chatHash).emit('room.generalCommand', {command: constant.disconnect.teacher.timeOut, content: data});
				})
				.catch(function(err){
					util.log('[TEACHER_LEAVE_ROOM] ERROR: '+err, 'red', 'white');
				});
			}, 10000);
		}

	},

	disconnectTeacher: function(obj, resolve, reject){
		if (typeof obj.data === undefined){
			return reject("handler_teacher_invalid_disconnect_teacher_params");
		}

		var data = obj.data;

		util.log('[TEACHER_DISCONNECTION] DISCONNECTING TEACHER -> '+JSON.stringify(data), 'red');

		var chatRoomIdx = util.getIndex(connect.chatRooms, {room: data.chatHash});
		util.log('[TEACHER_DISCONNECTION] CHECK IF ROOM EXISTS -> '+chatRoomIdx, 'yellow');

		model.updateLessonOnAir(
			{status: 0, connect_flag:0},
			{
				where: {chat_hash: data.chatHash}
			}
		)
		.then(function(){

			if (chatRoomIdx > -1) {
				delete connect.chatRooms[chatRoomIdx];
				util.log('[TEACHER_DISCONNECTION] REMOVING TEACHER FROM ROOM -> '+data.chatHash, 'red');
			}

			return resolve();

		})
		.catch(function(err){
			util.log('[TEACHER_DISCONNECTION] ERROR: '+err, 'red', 'white');
			return reject(err);
		});

	}

};