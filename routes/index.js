var express = require("express");
var router = express.Router();
var passport = require("passport");
var User  = require("../models/user");
var middleware = require("../middleware");
var Notification = require("../models/notification");

//root route
router.get("/",function(req,res){
	res.render("landings");
});

// ==================
// Auth Routes
// ==================

//show register form
router.get("/register", function(req,res){
	res.render("register");
});

//handle signup logic
router.post("/register", function(req,res){
	var newUser = new User({username : req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err) {
			req.flash("error",err.message);
			return res.redirect("/register");
		} else {
			passport.authenticate("local")(req,res, function(){
				req.flash("success","Welcome to YelpCamp " + user.username);
				res.redirect("/campgrounds");
			});
		}
	});
});

//show login form
router.get("/login", function(req,res){
	res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local", {
	successRedirect : "/campgrounds",
	failureRedirect : "/login"
}),function(req,res){
});

//logout route
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success","Logged you out!");
	res.redirect("/campgrounds");
});

// notification routes

// render notification index page
router.get("/notifications", middleware.isLoggedIn, async function(req,res){
	try{
		// find all notifications of the current loggedIn user
		let user = await User.findById(req.user._id).populate({
			path : "notifications"
		}).exec();
		let allNotifications = user.notifications;
		res.render("notification",{allNotifications});
	} catch(err){
		req.flash("error", err.message);
    	res.redirect("back");
	}
})

// particular notification
router.get("/notifications/:id", middleware.isLoggedIn, async function(req,res){
	try{
		let notification = await Notification.findById(req.params.id);
		notification.isRead = true;
		notification.save();
		res.redirect("/campgrounds/"+notification.campgroundId);
	} catch(err){
		req.flash("error", err.message);
		res.redirect("back");
	}
})

module.exports = router;