/* file server module */
var fs = require('fs');
module.exports = {
	/* set up port */
	port: 3030,

	/* set up database name */
	dbName: "video_chat",
	/* set up database host */
	dbHost: "localhost",
	/* set up database username */
	dbUser: "devel",
	/* set up database password */
	dbPass: "",
	/* set up database time */
	dbTime: "+09:00",
	/* set up ssl */
	options: {
		key: fs.readFileSync('./ssl/gl_wildcard.nativecamp.net_2016.nopass.key'),
		cert: fs.readFileSync('./ssl/gl_wildcard.nativecamp.net_2016.crt'),
		ca: fs.readFileSync('./ssl/gl_wildcard.nativecamp.net_2016.chain')
	},
	/* set allowed sites */
	origins: ""
};