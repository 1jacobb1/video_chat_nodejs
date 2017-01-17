/* set dependencies */
var fs		= require('fs'),			// file system
	express = require('express'),		// routing
	crypto 	= require('crypto'),		// encrytpion
	moment	= require('moment'),		// time
	_		= require('underscore'),	// array handling
	app		= express();				// server

/* load load my js libraries */
var constant 	= require('./constant.js'),
	util		= require('./util.js'),
	ssl			= require('./ssl.js');

/* set server functions */
var server		= require('https').createServer(ssl.options, app),
	io			= require('socket.io').listen(server, {'origins': ssl.origins}),
	socket		= io.sockets,
	peer		= require('peer').ExpressPeerServer;

/* set app engine */
app.use('/peerjs', peer(server, {debug: true}));

var server = server.listen(ssl.port, '0.0.0.0', function(){
	util.log('[SOCKET] LISTENING TO PORT '+ssl.port, 'green');
});

var teachersRoom = {};

io.on('connection', function(socket) {
	
	socket.on('common.connectRoom', function(data) {
		util.try(function(resolve, reject) {
			// connect room data validation
			dataValidation(data, reject);
			// add teacher to teachesRoom
			addTeacherRoom(data);
			console.log(teachersRoom);
		});
	});
});

function dataValidation(data, reject) {
	if (typeof data === undefined) {
		return reject('undefined variable data');
	}
	if (typeof data.memberType === undefined) {
		return reject('undefined variable data.memberType');
	}
}

function addTeacherRoom(data) {
	// check if a teacher and no teacher room
	if (data.memberType == "teacher" && typeof teachersRoom['teacher_' + data.teacherId] === 'undefined') {
		teachersRoom['teacher_' + data.teacherId] = {
			teacherId : parseInt(data.teacherId), 
			connectedUsers : {},
			created : util.currentTime()
		};
	}
	// check if a user and user was not yet connected to teachersRoom
	if (data.memberType == "student" && typeof teachersRoom['teacher_' + data.teacherId].connectedUsers['student' + data.studentId] === 'undefined') {
		teachersRoom['teacher_' + data.teacherId].connectedUsers['student' + data.studentId] = {
			studentId : parseInt(data.student),
			created : util.currentTime()
		};
	}
}