var mongoose = require("mongoose");

//Schema Setup
var campgroundSchema = mongoose.Schema({
    name : String,
    price : String,
	image : String,
    description : String,
    isVerified : {
        type : Boolean,
        default : false
    },
    author : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username : String
    },
    comments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ],
    reviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Review"
        }
    ],
    rating : {
        type : Number,
        default : 0
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);