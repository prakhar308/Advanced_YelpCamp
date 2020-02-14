var express = require("express");
var router = express.Router({mergeParams : true});
var Campground = require("../models/campground");
var middleware = require("../middleware");
var Review = require("../models/review");

// review index route
// the idea is to show only 5 latest reviews on the campground page and there is going to be a link to see all the reviews.
// it will lead to the reviews index route which we define here
router.get("/reviews",function(req,res){
	Campground.findById(req.params.id).populate({
		path : "reviews",
		options : {sort : {createdAt : -1}}
	}).exec(function(err,campground){
		if(err){
			req.flash("error", err.message);
            return res.redirect("back");
		} else {
			res.render("reviews/index",{campground : campground});
		}
	})
})


// review new route - display a page to add a review
// middlewares - isLoggedIn and checkReviewExistence because we only want to allow 1 single review per user
router.get("/reviews/new",middleware.isLoggedIn,middleware.checkReviewExistence,function(req,res){
	Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {campground: campground});
    });
})


// review create route - post request to create a new review
router.post("/reviews",middleware.isLoggedIn,middleware.checkReviewExistence,function(req,res){
	// first find the campground for which you want to add the review using it's id
	Campground.findById(req.params.id).populate("reviews").exec(function(err,campground){
		if(err){
			req.flash("error", err.message);
            return res.redirect("back");
		}
		// convert review rating from string to int
		req.body.review.rating = parseInt(req.body.review.rating);
		Review.create(req.body.review,function(err,review){
			if(err){
				req.flash("error", err.message);
            	return res.redirect("back");
			}
			// add username,id and campground to review
			review.author.id = req.user._id;
			review.author.username = req.user.username;
			review.campground = campground;
			// save review
			review.save();
			campground.reviews.push(review);
			// calculate the new average review for the campground
			campground.rating = calculateAverage(campground.reviews);
            //save campground
            campground.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/campgrounds/' + campground._id);
		});
	});
});


// review edit route - display page to edit review
router.get("/reviews/:review_id/edit",middleware.checkReviewOwnership,function(req,res){
	Review.findById(req.params.review_id,function(err,foundReview){
		if(err){
			req.flash("error", err.message);
            return res.redirect("back");
		}
		res.render("reviews/edit",{campground_id: req.params.id,review : foundReview});
	})
})


// review update route
router.put("/reviews/:review_id",middleware.checkReviewOwnership,function(req,res){
	
	// convert review rating from string to int
	req.body.review.rating = parseInt(req.body.review.rating);
	
	Review.updateOne({"_id" : req.params.review_id},req.body.review,{new : true})
	.then(function(updatedReview){
		return Campground.findById(req.params.id).populate("reviews").exec();
	})
	.then(function(campground){
		// recalculate campground average
        campground.rating = calculateAverage(campground.reviews);
        //save changes
        campground.save();
        req.flash("success", "Your review was successfully edited.");
        res.redirect('/campgrounds/' + campground._id);
	})
	.catch(function(err){
		req.flash("error",err.message);
		res.redirect("back");
	})
})


// review delete route
router.delete("/reviews/:review_id",middleware.checkReviewOwnership,function(req,res){
	Review.deleteOne({"_id" : req.params.review_id})
	.then(function(){
		return Campground.findOneAndUpdate({"_id" : req.params.id},{$pull : {reviews : req.params.review_id}},{new : true})
		.populate("reviews")
		.exec(); 
	})
	.then(function(campground){
		// recalculate campground average
        campground.rating = calculateAverage(campground.reviews);
        //save changes
        campground.save();
        req.flash("success", "Your review was deleted successfully.");
        res.redirect("/campgrounds/" + req.params.id);
	})
	.catch(function(err){
		req.flash("error",err.message);
		res.redirect("back");
	})
})


function calculateAverage(reviews){
	if(reviews.length == 0)
		return 0;
	var sum = 0;
	reviews.forEach(function(review){
		sum += review.rating;
	});
	return (sum/reviews.length);
}

module.exports = router;