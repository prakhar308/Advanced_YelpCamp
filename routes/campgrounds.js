var express = require("express");
var router = express.Router({mergeParams : true});
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX- show all campgrounds
router.get("/campgrounds",function(req,res){
	// search
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		//get all campgrounds from db
		Campground.find({name : regex},function(err,allCampground){
			if(err) console.log(err);
			else res.render("campgrounds/index", {campgrounds : allCampground, currentUser : req.user});
		});
	}
	else{
		//get all campgrounds from db
		Campground.find({},function(err,allCampground){
			if(err) console.log(err);
			else res.render("campgrounds/index", {campgrounds : allCampground, currentUser : req.user});
		});
	}
});

//CREATE- add new campground to db
router.post("/campgrounds", middleware.isLoggedIn, function(req,res){
	//get data from form and create a new campground object
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id : req.user._id,
		username : req.user.username
	}
	var newCampground = {name : name, price : price,image : image, description : description, author : author};
	//create a new campground and save to database
	Campground.create(newCampground, function(err,newlyCreated){
		if(err) console.log(err);
		else res.redirect("/campgrounds"); 
	});
});

//NEW- display form to create new campground
router.get("/campgrounds/new", middleware.isLoggedIn, function(req,res){
	res.render("campgrounds/new");
});

//SHOW- display info about particular campground using id
router.get("/campgrounds/:id", function(req,res){
	//find the campground with provided id
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err) console.log(err);
		else res.render("campgrounds/show",{campground : foundCampground});
	});
});

//EDIT- display form to edit campground
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground : foundCampground});		
	});
});

//UPDATE- update campground
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req,res){
	//find an update correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, {new : true},
		function(err, updatedCampground){
			if(err) res.redirect("/campgrounds");
			else res.redirect("/campgrounds/" + req.params.id);
	});
});

//DESTROY- delete campground route
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err) res.redirect("/campgrounds");
		else res.redirect("/campgrounds");
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;