module.exports = {
	lesson: {
		lessonTime: 1560
	},
	onair: {
		wait: "1",
		reservation: "2",
		chat: "3"
	},
	disconnect: {
		teacher: {
			finished: "teacherLessonFinished",
			sudden: "teacherSuddenDisconnect",
			others: "teacherLessonDisconnectOthers",
			timeOut: "teacherTimedOut",
			forceReconnect: "teacherForceReconnect"
		},
		student: {
			finished: "studentLessonFinished",
			sudden: "studentSuddenDisconnect",
			timeOut: "studentTimedOut"
		}
	},
};