var express =require("express");
var router =express.Router();
var passport =require("passport");
var Trail = require("../models/trail");
var User =require("../models/user");

router.get("/",function(req,res){
	res.render("landing");
})


//show register form
router.get("/register",function(req,res){
	res.render("register",{page:"register"});
})

//handle sign up logic
router.post("/register",function(req,res){
	var newUser = new User({
		username:req.body.username,
		firstname:req.body.firstname,
		lastname:req.body.lastname,
		avatar:req.body.avatar,
		email:req.body.email
	});
	
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("register", {error: err.message});
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success","Welcome to TrailShare " +user.username);
			res.redirect("/trails")
		})
	})
})

//show login form
router.get("/login",function(req,res){
	res.render("login",{page:"login"});
})

//handle login logic
router.post("/login",passport.authenticate("local",
	{
		successRedirect: "/trails",
		failureRedirect: "/login"
	}),function(req,res){
})
 
//logout
router.get("/logout",function(req,res){
	req.logout();
	req.flash("success","Logged out!")
	res.redirect("/trails");
})

//user profile
router.get("/users/:id",function(req,res){
	User.findById(req.params.id,function(err,foundUser){
		if(err){
			req.flash("error","Something Went Wrong");
			res.redirect("/back");
		}
		Trail.find().where("author.id").equals(foundUser._id).exec(function(err,foundTrails){
			if(err){
				req.flash("error","Something Went Wrong");
				res.redirect("/back");
			}
			res.render("users/show",{user:foundUser,trails:foundTrails});
		})
	})
})

module.exports =router;
