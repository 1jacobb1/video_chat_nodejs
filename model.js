var util		= require('./util.js'),
	constant 	= require('./constant.js'),
	db			= require('./database.js'),
	moment		= require('moment');

module.exports = {
	updateLessonOnAir: function(values, where){
		return db.on_airs.update(values, where)
	},
};