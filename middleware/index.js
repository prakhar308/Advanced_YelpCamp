var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review")
var middlewareObj = {};

//middleware for Campground Authorization
middlewareObj.checkCampgroundOwnership = function(req, res, next){
    //is user loggedIn
	if(req.isAuthenticated()) {
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err) {
				req.flash("error","Campground not found");
				res.redirect("back");
			}
			else {
				//does user own the campground?
				if(foundCampground.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error","You don't have permission to that");
					//otherwise redirect
					res.redirect("back");
				}
			} 
		});
	} else {
		req.flash("error","You need to be logged in to that");
		res.redirect("back");
	}
}

//middleware for Comment Authorization
middlewareObj.checkCommentOwnership = function(req, res, next){
    //is user loggedIn
	if(req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err) res.redirect("back");
			else {
				//does user own the comment?
				if(foundComment.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error","You don't have permission to do that");
					//otherwise redirect
					res.redirect("back");
				}
			} 
		});
	} else {
		req.flash("error","You need to be logged in to do that");
		res.redirect("back");
	}
}

// middleware for review authorization
middlewareObj.checkReviewOwnership = function(req,res,next){
	// is user loggedIn
	if(req.isAuthenticated()){
		Review.findById(req.params.review_id,function(err,foundReview){
			if(err) res.redirect("back");
			else{
				// does this user own the review
				if(foundReview.author.id.equals(req.user._id))
					next();
				else{
					req.flash("error","You don't have permission to that");
					res.redirect("back");
				}
			}
		})
	} else {
		req.flash("error","You need to be logged in to do that");
		res.redirect("back");
	}
}

// middleware for review existence
middlewareObj.checkReviewExistence = function(req,res,next){
	Campground.findById(req.params.id).populate("reviews").exec(function(err,foundCampground){
		if(err){
			req.flash("error", "Campground not found.");
			res.redirect("back");
		} else {
			// check if current user id matches with any of the review's author id
			var foundUserReview = foundCampground.reviews.some(function(review){
				return review.author.id.equals(req.user._id);
			})
			if(foundUserReview){
				req.flash("error", "You already wrote a review");
                return res.redirect("/campgrounds/"+foundCampground._id);
			}
			next();
		}		
	})
}

//middleware for Authentication
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()) return next();
	req.flash("error", "You need to be logged in to do that!!");
	res.redirect("/login");
}

module.exports = middlewareObj;