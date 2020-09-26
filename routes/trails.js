var express =require("express");
var router =express.Router();
var Trail = require("../models/trail");
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options={
	provider:"google",
	httpAdapter:"https",
	apiKey:process.env.GEOCODER_API_KEY,
	formatter:null
}
var geocoder = NodeGeocoder(options);

//INDEX - show all trails
router.get("/trails", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Trail.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, alltrails) {
            Trail.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
					if(alltrails.length<1){
						req.flash("error","No Trails Match That Query");
						res.redirect("back");
					}else{
						res.render("trails/index", {
                        trails: alltrails,
						page:"trails",
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: req.query.search
                    	});
					}
                }
            });
        });
    } else {
        // get all trails from DB
        Trail.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, alltrails) {
            Trail.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("trails/index", {
                        trails: alltrails,
						page:"trails",
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: false
                    });
                }
            });
        });
    }
});





//CREATE - add new trail to DB
router.post("/trails",middleware.isLoggedIn,function(req,res){
	var newTrail= req.body.newTrail;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	geocoder.geocode(req.body.newTrail.location,function(err,data){
		if(err||!data.length){
			req.flash("error","Invalid address");
			return res.redirect("back");
		}
		newTrail.location=data[0].formattedAddress;
		newTrail.author = author;
		Trail.create(newTrail,function(err,newlyCreated){
			if(err){
				req.flash("error","Something Went Wrong");
				console.log(err);
				res.redirect("back");
			}else{
				req.flash("success","Successfully Added Trail");
				res.redirect("/trails");
			}
		})
	})
})

//NEW - show form to create new trail
router.get("/trails/new",middleware.isLoggedIn,function(req,res){
	res.render("trails/new");
})

//SHOW - shows more info about one trail
router.get("/trails/:id",function(req,res){
	Trail.findById(req.params.id).populate("comments likes").exec(function(err,foundTrail){
		if(err){
			req.flash("error","Something Went Wrong");
			console.log(err);
			res.redirect("back");
		}else{
			res.render("trails/show",{trail:foundTrail});
		}
	})
})

// EDIT - edit form of trail
router.get("/trails/:id/edit",middleware.checkTrailOwnership,function(req,res){
	Trail.findById(req.params.id,function(err,foundTrail){
		res.render("trails/edit",{trail:foundTrail});
	})
})
//UPDATE - update trail
router.put("/trails/:id",middleware.checkTrailOwnership,function(req,res){
	var newTrail= req.body.newTrail;
	geocoder.geocode(req.body.newTrail.location,function(err,data){
		if(err||!data.length){
			req.flash("error","Invalid address");
			return res.redirect("back");
		}
		newTrail.location=data[0].formattedAddress;
		Trail.findByIdAndUpdate(req.params.id,newTrail,function(err,updatedTrail){
			if(err){
				req.flash("error","Something Went Wrong");
				console.log(err);
				res.redirect("back");
			}else{
				req.flash("success","Successfully Updated Trail");
				res.redirect("/trails/"+req.params.id);
			}
		})
	})
})

//DELETE - delete trail
router.delete("/trails/:id",middleware.checkTrailOwnership,function(req,res){
	Trail.findByIdAndRemove(req.params.id,function(err){
		if(err){
			req.flash("error","Something Went Wrong");
			console.log(err);
			res.redirect("back");
		}
		else{
			req.flash("success","Trail Deleted");
			res.redirect("/trails/")
		}
	})
})

// Trail Like Route
router.post("/trails/:id/like", middleware.isLoggedIn, function (req, res) {
    Trail.findById(req.params.id, function (err, foundTrail) {
        if (err) {
            console.log(err);
			req.flash("error","Something Went Wrong");
            return res.redirect("/trails");
        }
        // check if req.user._id exists in foundTrail.likes
        var foundUserLike = foundTrail.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundTrail.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundTrail.likes.push(req.user);
        }
        foundTrail.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/trails");
            }
            return res.redirect("/trails/" + foundTrail._id);
        });
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports =router;
