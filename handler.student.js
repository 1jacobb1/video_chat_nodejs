var connect 	= require('./connect.js'),
	util		= connect.util,
	model		= require('./model.js'),
	constant	= connect.constant;

module.exports = {
	registerStudent: function(obj, res, rej){
		util.log('[REGISTER_STUDENT] ADDING STUDENT TO CHAT ROOM', 'green');

		if (typeof obj === undefined || typeof obj.data === undefined) {
			return rej('handler_student_invalid_register_student_params');
		}

		var data = obj.data;
		var chatRoomIdx = util.getIndex(connect.chatRooms, {room: data.chatHash});
		util.log('[REGISTER_STUDENT] CHECKING IF ROOM EXISTS -> '+chatRoomIdx, 'yellow');

		if (chatRoomIdx <= -1){
			return rej('handler_student_no_room');
		}

		if (typeof connect.chatRooms[chatRoomIdx].user !== "undefined" && connect.chatRooms[chatRoomIdx].user !== null){
			return rej('handler_student_room_already_occupied');
		}

		// insert student to the room
		connect.chatRooms[chatRoomIdx].user = data.userId;
		connect.chatRooms[chatRoomIdx].studentDisconnect = false;
		util.log('[REGISTER_STUDENT] STUDENT DONE INSERTING TO ROOM', 'green');

		if (typeof connect.chatRooms[chatRoomIdx].start === "undefined" || connect.chatRooms[chatRoomIdx].start === ""){
			util.log('[REGISTER_STUDENT] INSERTING START DATE', 'green');
			connect.chatRooms[chatRoomIdx].start = util.currentTime();
		}

		return res();
	},

	studentLeaveRoom: function(obj, socket, disconnection){
		if (typeof obj === undefined || typeof obj.data === undefined){
			return reject();
		}

		var data = obj.data;
		var elem = this;


		var chatRoomIdx = util.getIndex(connect.chatRooms, {room: data.chatHash});
		util.log("[STUDENT_LEAVE_ROOM] CHECK IF ROOM EXISTS INDEX -> "+chatRoomIdx);

		if (chatRoomIdx > -1){
			connect.chatRooms[chatRoomIdx].user = null;
			util.log("[STUDENT_LEAVE_ROOM] REMOVING STUDENT FROM ROOM");
		}

		if (chatRoomIdx > -1 && 
			typeof connect.chatRooms[chatRoomIdx].studentDisconnect !== "undefined" &&
			connect.chatRooms[chatRoomIdx].studentDisconnect === false &&
			disconnection !== "client namespace disconnect") {
			connect.chatRooms[chatRoomIdx].studentDisconnect = setTimeout(function(){
				util.try(function(res, rej){
					if (typeof elem.disconnectStudent === "function") { elem.disconnectStudent(obj,res,rej); }
				});
			}, 5000);
		}
	},

	disconnectStudent: function(obj, res, rej){
		if (typeof obj.data === undefined){
			return rej("invalid_student_params");
		}

		var data = obj.data;


		var chatRoomIdx = util.getIndex(connect.chatRooms, {room: data.chatHash});
		if (chatRoomIdx > -1){
			delete connect.chatRooms[chatRoomIdx];
			util.log("[DISCONNECT_STUDENT] REMOVING STUDENT FROM ROOM");
		}

	}
};