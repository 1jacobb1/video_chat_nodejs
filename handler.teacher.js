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

		if(typeof connect.chatRooms[data.chatHash] === 'undefined') {
			connect.chatRooms[data.chatHash] = {
				room: data.chatHash,
				created: util.currentTime(),
				start: '',
				user: data.studentId == 0 ? null : parseInt(data.studentId),
				teacher: parseInt(data.teacherId),
				studentDisconnect: false,
				teacherDisconnect: false
			};
		} else {
			if (typeof connect.chatRooms[data.chatHash].teacher !== 'undefined' && connect.chatRooms[data.chatHash].teacher !== null){
					util.log('[TEACHER_CONNECT] ROOM ALREADY OCCUPIED', 'red');
					return reject('room_already_occupied');
				}

				if (typeof connect.chatRooms[data.chatHash].teacherDisconnect !== 'undefined' && connect.chatRooms[data.chatHash].teacherDisconnect !== null){
					clearTimeout(connect.chatRooms[data.chatHash].teacherDisconnect);
					util.log('[TEACHER_CONNECT] CLEAR TIMEOUT FOR TEACHER DISCONNECTION', 'green');
				}

				connect.chatRooms[data.chatHash].teacher = parseInt(data.teacherId);
				connect.chatRooms[data.chatHash].teacherDisconnect = false;
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

		var data = obj.data;
		var element = this;

		util.log('[TEACHER_LEAVE_ROOM] CHECK IF ROOM IS EXISTING INDEX -> '+data.chatHash, 'yellow');

		if (typeof connect.chatRooms[data.chatHash] !== 'undefined'){
			util.log('[TEACHER_LEAVE_ROOM] REMOVE TEACHER FROM ROOM');
			connect.chatRooms[data.chatHash].teacher = null;
		}

		if( typeof connect.chatRooms[data.chatHash] !== 'undefined' &&
			typeof connect.chatRooms[data.chatHash].teacherDisconnect !== 'undefined' &&
			connect.chatRooms[data.chatHash].teacherDisconnect === false &&
			disconnection !== 'client namespace disconnect'
		) {
			util.log('[TEACHER_LEAVE_ROOM] SETTNG TIMEOUT FOR TEACHER DISCONNECTION -> '+connect.chatRooms[data.chatHash].teacherDisconnect, 'yellow');

			/* declare timeout disconnection */
			connect.chatRooms[data.chatHash].teacherDisconnect = setTimeout(function(){

				/* attempt automatic disconnection of teacher */
				util.try(function(resolve, reject){
					if (typeof element.disconnectTeacher === 'function') { element.disconnectTeacher(obj,resolve,reject); }
				})
				.then(function(){
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
		util.log('[TEACHER_DISCONNECTION] CHECK IF ROOM EXISTS -> '+data.chatHash, 'yellow');

		model.updateLessonOnAir(
			{status: 0, connect_flag:0},
			{
				where: {chat_hash: data.chatHash}
			}
		)
		.then(function(){

			if (typeof connect.chatRooms[data.chatHash] !== 'undefined') {
				delete connect.chatRooms[data.chatHash];
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