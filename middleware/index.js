var Trail = require("../models/trail");
var	Comment = require("../models/comment");
var middlewareObj={}
middlewareObj.checkCommentOwnership = function(req,res,next){
	//if user logged in
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			req.flash("error","Something Went Wrong");
			res.redirect("back")
		}else{
			//does user own this comment
			if(foundComment.author.id.equals(req.user._id)){
				next();
			}else{
				req.flash("error","Permission Denied");
				res.redirect("back");
			}		
		}
	})
	}else{
		req.flash("error","Please Login First!");
		res.redirect("back");
	}
}
middlewareObj.checkTrailOwnership = function(req,res,next){
	//if user logged in
	if(req.isAuthenticated()){
		Trail.findById(req.params.id,function(err,foundTrail){
		if(err){
			req.flash("error","Something Went Wrong");
			res.redirect("back")
		}else{
			//does user own this trail
			if(foundTrail.author.id.equals(req.user._id)){
				next();
			}else{
				req.flash("error","Permission Denied");
				res.redirect("back");
			}		
		}
	})
	}else{
		req.flash("error","Please Login First!");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = function(req,res,next){
	if(req.isAuthenticated()){
	    return next();
	   }
	req.flash("error","Please Login First!");
	res.redirect("/login");
}


module.exports = middlewareObj;