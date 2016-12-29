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

exports.io = io;
exports.teachers = [];
exports.students = [];
exports.admins = [];
exports._ = _;
exports.util = util;
exports.constant = constant;
exports.chatRooms = [{
	room: '',
	created: '',
	start:'',
	user: null, 
	teacher: null,
	studentDisconnect: false,
	teacherDisconnect: false
}];