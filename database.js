var sequelize 		= require('sequelize'),
	constant 		= require('./constant.js'),
	util			= require('./util.js'),
	ssl				= require('./ssl');

var db = new sequelize(
	ssl.dbName,
	ssl.dbUser,
	ssl.dbPass,
	{
		dialect: "mysql",
		timezone: ssl.dbTime,
		host: ssl.dbHost,
		logging: function(str){
			util.log('[SQL] ' + str, 'white', 'black');
		}
	}
);

db.authenticate()
.then(function(err){
	if (typeof err !== "undefined") {
		util.log(err, 'white', 'red');
		process.exit();
	}
});

module.exports = {
	sequelize: sequelize,
	connection: db,
	on_airs: db.define('on_airs', {
		teacher_id: sequelize.INTEGER,
		user_id: sequelize.INTEGER,
		status: sequelize.INTEGER,
		connect_flag: sequelize.INTEGER,
		chat_hash: sequelize.STRING,
		created_ip: sequelize.STRING,
		modified_ip: sequelize.STRING,
		created_date: sequelize.DATE,
		modified_date: sequelize.DATE
	}, {
		timestamps: true,
		createdAt: 'created_date',
		updatedAt: 'modified_date',
		deletedAt: false
	}),
};