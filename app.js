require("dotenv").config();
var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	flash = require("connect-flash"),
	moment = require("moment"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	
	Trail = require("./models/trail"),
	Comment = require("./models/comment"),
	User = require("./models/user"),

	trailRoutes = require("./routes/trails"),
	commentRoutes = require("./routes/comments"),
	indexRoutes = require("./routes/index");

//connect database
mongoose.connect('mongodb://localhost:27017/trail-share', { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

//set view engine
app.set("view engine","ejs");
//parse post request
app.use(bodyParser.urlencoded({extended:true}));
//import CSS
app.use(express.static("./public"));
//override
app.use(methodOverride("_method"));
//use connect-flash
app.use(flash());
//use moment
app.locals.moment = require("moment");

//passport configuration
app.use(require("express-session")({
	secret :"abc",
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error =req.flash("error");
	res.locals.success =req.flash("success");
	next();
})

app.use(trailRoutes);
app.use(commentRoutes);
app.use(indexRoutes);


app.listen(3000,function(){
	console.log("TrailShare Server has started");
})