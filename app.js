var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	flash = require("connect-flash"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	methodOvrride = require("method-override");
	User  = require("./models/user"),
	seedDB = require("./seeds");

// requiring routes
var commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	authRoutes = require("./routes/index"),
	reviewRoutes = require("./routes/reviews");

mongoose.connect("mongodb://localhost:27017/yelp_camp_v12", {useNewUrlParser : true});
mongoose.set('debug',true);

app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOvrride("_method"));
app.use(flash());
//seedDB();

//Passport config
app.use(require("express-session")({
	secret : "Logan Last man standing",
	resave : false,
	saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//call this function on every route
app.use(async function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	
	// if any user is logged in then find all his unread notifications 
	if(req.user){
		try{
			let user = await User.findById(req.user._id)
							.populate({
								path : 'notifications',
								match : {isRead : false}
							})
							.exec();
			res.locals.unreadNotificationCount = user.notifications.length;
		} catch(err){
			console.log(err.message);
		}
	}
	next();
});

app.use(authRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);
app.use("/campgrounds/:id",reviewRoutes);

app.listen(3000,function(){
	console.log("The YelpCamp server has started");
});	