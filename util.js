var chalk	= require('chalk'),
	moment	= require('moment'),
	_		= require('underscore'),
	promise = require('promise');

module.exports = {
	try: function(f){
		return new Promise(f);
	},
	/**
	* display log messages
	*/
	log: function(message, color, bgColor){
		bgColor = (typeof bgColor !== 'undefined') ? 'bg' + bgColor.charAt(0).toUpperCase() + bgColor.slice(1) : 'bgBlack';
		color = (typeof color ==='undefined') ? 'white' : color;
		message = this.currentTime() + " ->> " + message;
		try{
			return console.log(chalk[color][bgColor](message));
		} catch (ex) {
			this.log(ex.toString(), 'white', 'red');
			return process.exit();
		}
	},
	/**
	* get server current time
	*/
	currentTime: function(format){
		format = (typeof format === "undefined") ? "YYYY-MM-DD HH:mm:ss" : format;

		return moment().format(format);
	},
	/**
	* display error
	*/
	logError: function(message){
		/* error message should not be empty */
		if (typeof message === 'undefined' || message.length === 0) {
			return false;
		}

		/* log the error */
		return this.log("[ERROR] " + message, 'red', 'white');
	},
	/**
	* get the index, in an array, depends on the condition
	**/
	getIndex: function(list, filter){
		var index = _.findLastIndex(list, filter);
		return index;
	},
	/**
	* clean empty index in an array
	**/
	compact: function(list){
		return _.compact(list);
	},
	/**
	* display active rooms
	*/
	outputRooms: function(rooms){
		// var elem = this;
		// var arr = [];
		// rooms.map(function(element, index){
		// 	arr.push(element.room);
		// });
		// elem.log('[ROOMS] -> '+ JSON.stringify(arr), 'magenta');
	},
};