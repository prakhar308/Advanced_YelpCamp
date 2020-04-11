var mongoose = require("mongoose");

var notificatonSchema = mongoose.Schema({
	text: String,
	campgroundId : String,
	isRead : {
		type : Boolean,
		default : false
	}
},{
	timestamps: true
})

module.exports = mongoose.model("Notification",notificatonSchema);