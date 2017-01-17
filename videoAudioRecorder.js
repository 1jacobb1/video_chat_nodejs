var fs = require("fs"),
	ffmpeg = require("fluent-ffmpeg"),
	path = require("path");
	util = require("./util.js");
	
module.exports = {
	writeToDisk : function(dataURL, fileName) {
		var fileExtension = fileName.split('.').pop(),
		fileRootNameWithBase = './uploads/' + fileName,
		filePath = fileRootNameWithBase,
		fileID = 2,
		fileBuffer;

		// @todo return the new filename to client
		while (fs.existsSync(filePath)) {
			filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
			fileID += 1;
		}

		dataURL = dataURL.split(',').pop();
		fileBuffer = new Buffer(dataURL, 'base64');
		fs.writeFileSync(filePath, fileBuffer);

		console.log('filePath', filePath);
		
		module.exports.merge('', fileName);
	},
	
	merge: function(socket, fileName) {
		var FFmpeg = require('fluent-ffmpeg');

		var videoFile = path.join(__dirname, 'uploads', fileName + '.webm'),
			mergedFile = path.join(__dirname, 'uploads', fileName + '-merged.webm');
			console.log(videoFile);
		new FFmpeg({
			source: videoFile
		})
		.on('error', function (err) {
			socket.emit('ffmpeg-error', 'ffmpeg : An error occurred: ' + err.message);
		})
		.on('progress', function (progress) {
			socket.emit('ffmpeg-output', Math.round(progress.percent));
		})
		.on('end', function () {
			socket.emit('merged', fileName + '-merged.webm');
			console.log('Merging finished !');

			// removing audio/video files
			fs.unlink(videoFile);
		})
		.saveToFile(mergedFile);
	},
	
	chunkingWriteToDisk: function(data) {
		util.try(function(resolve, reject) {
			if (typeof data.video === 'undefined') {
				return console.log('video undefined');
			}
			
			/* set filename and dataURL */
			let fileName = data.video.fileName;
			let dataURL = data.video.dataURL.split(',').pop();
			
			var fileExtension = fileName.split('.').pop(),
			fileRootNameWithBase = path.join(__dirname, 'uploads', fileName),
			filePath = fileRootNameWithBase,
			fileBuffer;
			
			fileBuffer = new Buffer(dataURL, 'base64');
			// video here is already saved as webm, and is playable through web browser
			fs.writeFileSync(filePath, fileBuffer);
			
			/* try to convert video */
			util.try(function(resVideo, rejVideo) {
				var saveAs = path.join(__dirname, 'uploads', fileName.split('.')[0] + '.mp4');
				
				/* convert to mp4 */
				ffmpeg(filePath)
				.videoCodec('libx264')
				.audioCodec('libmp3lame')
				.size('320x240')
				.on('error', function(err) {
					console.log(err);
				})
				.on('end', function() {
					console.log('done converting');
					/* next process -> send to then */
					resVideo(saveAs);
				})
				.save(saveAs);
			})
			.then(function(video) {
				let videoBaseFileName = path.join(__dirname, 'uploads', data.video.name + '-final.mp4');
				let videoBaseFileNameCopy = path.join(__dirname, 'uploads', data.video.name + '-tmp.mp4');
				
				/* check if video file name exists */
				if (fs.existsSync(videoBaseFileName)) {
					
					fs.createReadStream(videoBaseFileName).pipe(fs.createWriteStream(videoBaseFileNameCopy))
					.on('close', function(){
						/* append video */
						ffmpeg(videoBaseFileNameCopy)
						.input(video)
						.mergeToFile(videoBaseFileName)
						.on('end', function(){ fs.unlinkSync(video); fs.unlinkSync(videoBaseFileNameCopy); })
						.on('error', function(error){ util.logError(error); });
					});
					
					
					/* if exists merge video file */
					// ffmpeg(videoBaseFileName)
					// .mergeAdd(video)
					// .mergeToFile(videoBaseFileName, './uploads/tmp/')
					// .on('error', function(err) {
					// 	console.log(err);
					// })
					// .on('end', function() {
					// 	console.log('done merging');
					// 	console.log(videoBaseFileName + ' -> ' +video);
					// });
				} else {
					console.log('creating new final file');
					fs.renameSync(video, videoBaseFileName);
				}
			})
			.catch(function(err) {
				console.log(err.message);
			});
			
		})
		.then(function(msg) {
			
		})
		.catch(function(err) {
			console.log(err);
		});
		
	},
	
	mergeFiles: function() {
		console.log('test5');
		let file1 = path.join(__dirname, 'uploads', 'teacher_1-1-0716f74fabd475f524a2b8afc700b9563d867c6b1484555729.mp4'),
			file2 = path.join(__dirname, 'uploads', 'teacher_1-1-0716f74fabd475f524a2b8afc700b9563d867c6b1484555734.mp4'),
			file3 = path.join(__dirname, 'uploads', 'teacher_1-1-0716f74fabd475f524a2b8afc700b9563d867c6b1484555739.mp4'),
			saveAs = path.join(__dirname, 'uploads', 'jacob.mp4');
			
		var saveToPath = path.join(__dirname, 'uploads', 'tmp');
		console.log(saveToPath);
		
		/* merge two files */
		ffmpeg()
		.addInput(file1)
		.addInput(file2)
		// .mergeToFile('./uploads/earth.mp4', './uploads/tmp/')
		.mergeToFile(saveAs, saveToPath)
		.on('error', function(err) {
			console.log(err.message);
		})
		.on('end', function() {
			console.log('done merging');
		});
	}
};