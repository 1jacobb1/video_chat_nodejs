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

		util.log('[REGISTER_STUDENT] CHECKING IF ROOM EXISTS -> '+data.chatHash, 'yellow');

		if (typeof data.chatHash === 'undefined'){
			return rej('handler_student_no_room');
		}

		if (typeof connect.chatRooms[data.chatHash] === 'undefined') {
			return rej('handler_student_room_does_not_exists');
		}

		if (typeof connect.chatRooms[data.chatHash].user !== "undefined" && connect.chatRooms[data.chatHash].user !== null){
			return rej('handler_student_room_already_occupied');
		}

		// insert student to the room
		connect.chatRooms[data.chatHash].user = parseInt(data.userId);
		connect.chatRooms[data.chatHash].studentDisconnect = false;
		util.log('[REGISTER_STUDENT] STUDENT DONE INSERTING TO ROOM', 'green');

		if (typeof connect.chatRooms[data.chatHash].start === "undefined" || connect.chatRooms[data.chatHash].start === ""){
			util.log('[REGISTER_STUDENT] INSERTING START DATE', 'green');
			connect.chatRooms[data.chatHash].start = util.currentTime();
		}

		return res();
	},

	studentLeaveRoom: function(obj, socket, disconnection){
		if (typeof obj === undefined || typeof obj.data === undefined){
			return reject();
		}

		var data = obj.data;
		var elem = this;

		util.log("[STUDENT_LEAVE_ROOM] CHECK IF ROOM EXISTS INDEX -> "+data.chatHash);

		if (typeof connect.chatRooms[data.chatHash] !== 'undefined'){
			connect.chatRooms[data.chatHash].user = null;
			util.log("[STUDENT_LEAVE_ROOM] REMOVING STUDENT FROM ROOM");
		}

		if ( typeof connect.chatRooms[data.chatHash] !== 'undefined' &&
			typeof connect.chatRooms[data.chatHash].studentDisconnect !== "undefined" &&
			connect.chatRooms[data.chatHash].studentDisconnect === false &&
			disconnection !== "client namespace disconnect") {
			connect.chatRooms[data.chatHash].studentDisconnect = setTimeout(function(){
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

		if (typeof connect.chatRooms[data.chatHash] !== 'undefined'){
			delete connect.chatRooms[data.chatHash];
			util.log("[DISCONNECT_STUDENT] REMOVING STUDENT FROM ROOM");
		}

	}
};