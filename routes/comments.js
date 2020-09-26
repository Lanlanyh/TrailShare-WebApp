var express =require("express");
var router =express.Router();
var Trail = require("../models/trail");
var	Comment = require("../models/comment");
var middleware = require("../middleware");

//CREATE - add new comment to DB
router.post("/trails/:id/comments",middleware.isLoggedIn,function(req,res){
	Trail.findById(req.params.id,function(err,foundTrail){
		if(err){
			req.flash("error","Something Went Wrong");
			console.log(err);
		}else{
			Comment.create(req.body.comment,function(error,foundComment){
				if(err){
					req.flash("error","Something Went Wrong");
					console.log(err);
				}else{
					//add username and id to comment and save
					foundComment.author.id=req.user._id;
					foundComment.author.username=req.user.username;
					foundComment.save();
					//add comment to trail and save
					foundTrail.comments.push(foundComment);
					foundTrail.save();
					req.flash("success","Successfully Added Comment");
					res.redirect("/trails/" + foundTrail._id);
				}
			})
		}
	})
})

//UPDATE - update comment
router.put("/trails/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err){
			req.flash("error","Something Went Wrong");
			res.redirect("back");
		}else{
			req.flash("success","Successfully Updated Comment");
			res.redirect("/trails/"+req.params.id);
		}
	})
	
})
//DELETE - delete comment
router.delete("/trails/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			req.flash("error","Something Went Wrong");
			res.redirect("back");
		}
		else{
			req.flash("success","Comment Deleted");
			res.redirect("/trails/"+req.params.id)
		}
	})
})

module.exports =router;