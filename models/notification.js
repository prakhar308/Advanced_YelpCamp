var mongoose = require("mongoose");

var notificatonSchema = mongoose.Schema({
	username : String,
	campgroundId : String,
	isRead : {
		type : Boolean,
		default : false
	}
})

module.exports = mongoose.model("Notification",notificatonSchema);