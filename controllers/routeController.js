const requiredObjects = require(`../objecList/objects`);
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require(`async`);
const moment = require("moment");
const requestIp = require("request-ip");



//Models
const User = require(`../models/User`);
const FriendStatus = require(`../models/friendStatus`);
const Token = require(`../models/Token`);
const Website = require("../models/Website");
const Feature = require("../models/Feature");
const Feedback = require("../models/Feedback");
const Guest = require("../models/Guest");

//Functions
const functionCntrl = require(`../controllers/functionsContoller`);

/* Quick Fixes */

//Add to feature
exports.featureAdd = function (req, res, next) {

    console.log(req.params.webId);
    let toFeature = new Feature({
        website: req.params.webId,
    });

    toFeature.save((err)=> {
        if (err) {return next(err);}
        res.redirect("/");
    });
}

//Get for messages
exports.GET_send_message = function(req, res, next) {
    res.send(`NOT IMPLEMENTED`); //toFix
}


//id redirect
exports.GET_id_redirect = function(req, res, next) {
    User.findById(req.params.id).exec((err, result)=> {
        if (err) {return next(err)};
        res.redirect(`/users/profile/${result.username}`);
    });
}

//Email redirect
/*
exports.redirectEmail = function(req, res, next) {
    User.findOne({"email": req.params.email}).exec((err, results)=>{
        if (err) throw "routeController > redirectEmail";

        if (!results) {
            res.send(`USER NOT FOUND`); //toFix
        }

        else {
            res.redirect(`/users/profile/${results.username}`);
        }

    });
}
*/

//Id redirect avatar
exports.idRedirect = function(req, res, next) {
    User.findById(req.params.id).exec((err, result)=> {
        res.redirect(`/publicAvatar/${result.email}`);
    });
}

/* Asset Renders */

//GET user web thumb 
exports.GET_webthumb =  function(req, res, next) {

    Website.findById(req.params.id).exec((err, result) => {
        if (err) {res.sendStatus(404); return;}
        
        if (result) {
            res.contentType(result.webThumb.contentType);
            res.send(result.webThumb.data);
            return;
        }
        else {
            res.send(`NO IMAGES FOUND`); //toFIX
        }

    });

};

/* Feedback */

//Send Feedback
exports.POST_sendFeedback = function(req, res, next) {

    let { email, message } = req.body;

    let feedbackForm = new Feedback({
        email,
        feedback: message
    });

    feedbackForm.save((err)=> {
        if (err) {return next(err);}
        res.send("Saved Feedback");
    });

}

/* Website popup*/

//Website Hover and website views
exports.GET_websiteHover = function(req, res, next) {
    let websiteId = req.params.id;

    //Find website and do deep population
    Website.findById(websiteId).populate("owner").populate({ path: "comments", populate: { path: "user" } }).exec((err, website)=> {
        if (err) { return next(err);}

        if (!website) {
            res.send("Website Doesnt Exist"); //toFix
        }

        if (website.comments.length === 0) {
            res.render("forUsers/partials/websiteDisplay", { moment: moment, website, owner: website.owner, user: req.user, comments: [] });
        }

        else {
            res.render("forUsers/partials/websiteDisplay", { moment: moment, website, owner: website.owner, user: req.user, comments: website.comments.reverse() });
        }

    });
}

exports.GET_visitorWebsiteHover = function (req, res, next) {
    if (!req.user) {
        let websiteId = req.params.id;

        async.parallel({
            guest: function(cb) {
                if (requestIp.getClientIp(req) === "::1" || requestIp.getClientIp(req) === "::ffff:127.0.0.1") {
                    return cb(null, "development mode");
                }
                else {
                    Guest.findOne({ ip: requestIp.getClientIp(req) }).exec(cb);

                }
            },
            website: function(cb) {
                Website.findById(websiteId).populate("owner").populate({ path: "comments", populate: { path: "user" } }).exec(cb);
            }
        }, (err, async)=> {

            if (err) {return next(err);}
            //toFix
            if (async.guest === "development mode") {
                if (async.website.comments.length === 0) {
                    res.render("forVisitors/partials/websiteDisplay", { moment: moment, website: async.website, owner: async.website.owner, comments: [] });
                    return;
                }
                else {
                    res.render("forVisitors/partials/websiteDisplay", { moment: moment, website: async.website, owner: async.website.owner, comments: async.website.comments.reverse() });
                    return
                }
            }

            let guestCheck = false;
            //Check if guest has seen the site
            for (let site of async.guest.viewedSite) {
                if (site.toString() === async.website._id.toString()) {
                    guestCheck = true;
                }
            }

            if (!guestCheck) {
                let guestArrayCopy = [...async.guest.viewedSite];

                guestArrayCopy.push(async.website._id);

                let guestInstance = {
                    $set: {
                        viewedSite: guestArrayCopy
                    }
                };

                Guest.findByIdAndUpdate(async.guest._id, guestInstance, {}, (err)=> {
                    if (err) {return next(err);}
                    let websiteInstance = {
                        $set: {
                            views: async.website.likes + 1
                        }
                    };
                    Website.findByIdAndUpdate(async.website._id, websiteInstance, {}, (err)=> {
                        if (err) {return next(err);};
                    });
                })
            }

            if (async.website.comments.length === 0) {
                res.render("forVisitors/partials/websiteDisplay", { moment: moment, website: async.website, owner: async.website.owner, comments: [] });
                return;
            }
            else {
                res.render("forVisitors/partials/websiteDisplay", { moment: moment, website: async.website, owner: async.website.owner, comments: async.website.comments.reverse() });
                return;
            }

        });        
    }
    else {
        next();
    }
}

/* Profile Page */

//User profile page
exports.GET_profile = function(req, res, next) {

    //Render function for profile
    function renderProfile(req, res, sortSetting, friendVal, profile) {

        //requried vars for pagination
        const pagination = req.query.pagination ? parseInt(req.query.pagination) : 6;
        const page = req.query.page ? parseInt(req.query.page) : 1;
    
        Website.find({ owner: profile._id }).populate("owner").skip((page-1) * pagination).limit(pagination).sort(sortSetting).exec((err, webResults)=> {
            if (err) throw `routeController > GET_discover_new`;      
            
            //quick fix
            friendVal.class === "no-display" ? friendVal.messageStat = "View Messages" : friendVal.messageStat = "Message";
            friendVal.class === "no-display" ? friendVal.styleAddWebsite = "display: flex;" : friendVal.styleAddWebsite = "display: none;";
    
            FriendStatus.find({"requestTo": req.user._id}).populate(`requestFrom`).exec((err, fstatRes)=> {
                if (err) {
                    console.log(`renderHome> fstatRes`) 
                    return next(err);
                }
    
                let fStatDisplay = [];
                
                //Push all the status with friend requests
                for (let val of fstatRes) {
                    if (val.status === 1) {
                        fStatDisplay.push(val);
                    }
                    else {
                                
                    }
                }

                console.log(friendVal.val + " value of friend val");

                //Websites are less than 6 disable the next page
                if (webResults.length < 6) {
                    res.render(`forUsers/homePage/profilePage`, { profile, webResults, friendVal, qryNextStat: "disabled", page, layout: `forUsers/homePage/homeLayout`, User: req.user, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                    return;
                }
                
                else {
                    res.render(`forUsers/homePage/profilePage`, { profile, webResults, friendVal, qryNextStat: "", page, layout: `forUsers/homePage/homeLayout`, User: req.user, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                    return;
                }

            });
        })
    
    }
    //Query for user's profile
    User.findOne({ username: req.params.username }).populate("websites").exec((err, userProfile)=> {
        if (err) {return next(err);}

        if (!userProfile) {
            res.send("Profile does not exist");
        }

        else {
            //Render friend status for qUser or user
            async.parallel({
                //From user's perspective
                user: function(cb) {
                    FriendStatus.findOne({ "requestFrom": req.user._id, "requestTo": userProfile._id }).populate("owner").exec(cb);
                },
                //From qUser's perspective
                qUser: function(cb) {
                    FriendStatus.findOne({ "requestFrom": userProfile._id, "requestTo": req.user }).populate("owner").exec(cb);
                }

            }, (err, asyncResult)=> {

                if (err) {return next(err);}

                //Add friend button value
                let friendVal = {};

                let userCheck = false;                

                //Check if its user's profile
                if (req.user.username === userProfile.username) {
                    friendVal = { val: ``, action: ``, class: "no-display" };
                    console.log("user profile");

                    //Render in ascending order
                    renderProfile(req, res, {date: -1}, friendVal, userProfile);
                    return;
                }
                
                //No requests yet
                if ((!asyncResult.user) && (!asyncResult.qUser)) {
                    console.log("no friend request ran");
                    friendVal = { val: "Add Friend", action: "/users/add_friend", class: "" };
                    renderProfile(req, res, {date: -1}, friendVal, userProfile);
                    return;
                }

                //User to qUser
                if (asyncResult.user) {
                    switch (asyncResult.user.status) {
                        case 1:
                            friendVal = {val: `Request Sent`, action: ``, class:`href-disabled`};
                            break;
                        case 2:
                            friendVal = {val: `✓ Friends`, action: `/`, class:`href-disabled`};
                            break;
                        case 3:
                            friendVal = {val: `Request Rejected`, action: `/`, class:`href-disabled`};
                            break;
                    }
                    renderProfile(req, res, {date: -1}, friendVal, userProfile);
                }

                //qUser from User
                if (asyncResult.qUser) {
                    switch (asyncResult.qUser.status) {
                        case 1:
                            friendVal = {val: `Respond To Request`, action: ``, class:`href-disabled`};
                            break;
                        case 2:
                            friendVal = {val: `✓ Friends`, action: `/`, class:`href-disabled`};
                            break;
                        case 3:
                            friendVal = {val: `Request Rejected`, action: `/`, class:`href-disabled`};
                            break;
                    }
                    renderProfile(req, res, {date: -1}, friendVal, userProfile);
                }

            });
        }
    })
}

//Profile Page for visitors
exports.GET_visitorProfile = function (req, res, next) {
    if (!req.user) {
        //Query for user's profile
        User.findOne({ username: req.params.username }).populate("websites").exec((err, userProfile)=> {
            if (err) {return next(err);}

            if (!userProfile) {
                res.send("Profile does not exist");
            }

            else {
                //requried vars for pagination
            const pagination = req.query.pagination ? parseInt(req.query.pagination) : 6;
            const page = req.query.page ? parseInt(req.query.page) : 1;

            Website.find({ owner: userProfile._id }).populate("owner").skip((page-1) * pagination).limit(pagination).sort({date: -1}).exec((err, webResults)=> {
                if (err) throw `routeController > GET_discover_new`;      

                    //Websites are less than 6 disable the next page
                    if (webResults.length < 6) {
                        res.render(`forVisitors/homePage/profilePage`, { profile: userProfile, webResults, qryNextStat: "disabled", page, layout: `forVisitors/homePage/homeLayout`});
                        return;
                    }
                    
                    else {
                        res.render(`firVisitors/homePage/profilePage`, { profile: userProfile, webResults, qryNextStat: "", page, layout: `forVisitors/homePage/homeLayout`});
                        return;
                    }

            })
            }
        })
    }
    else {
        next();
    }

}

/* Login and Register */

//Login Route
exports.renderLogin = function(req, res, next) {
    res.render(`login`, requiredObjects.registerLocals);
};

//Register Route
exports.renderRegister = function(req, res, next) {
    res.render(`register`, requiredObjects.registerLocals);
};

/* Confirmation */

//User confirmation
exports.GET_confirmation = function(req, res, next) {

    const userToken = req.params.userToken;

    //Find the account
    Token.findOne({"token": userToken}).populate(`_userId`).exec((err, result)=> {

        if (err) {return next(err);}

        if (!result) {
            res.sendStatus(404);
        }

        else {

            User.findById(result._userId._id).exec((err, userRes)=> {
                if (err) {return next(err);}

                if (userRes.isVerified === true) {
                    res.send("Token Expired");
                    return;
                }
    
                let userUpdate ={
                    $set: {
                        isVerified: true
                    }
                };
    
                User.findByIdAndUpdate(userRes._id, userUpdate, {}, (err, udpateRes)=> {
                    if (err) {return next(err);}

                    Token.findByIdAndDelete(result._id, (err, deleteRes)=> {
                        if (err) {return next(err);}
                        req.flash(`success`, `Account has been successfully created`);
                        res.redirect(`/users/login`);
                    });
                    
                });
    
            });

        }
    });
}

/* About Page */

exports.GET_about = function (req, res, next) {    

    async.parallel({
        fstat: function(cb) {
            FriendStatus.find({"requestTo": req.user._id}).populate("requestFrom").exec(cb);
        }
    },(err, async)=> {
        //Friend Status display
        let fStatDisplay = [];

        for (let val of async.fstat) {
            if (val.status === 1) {
                fStatDisplay.push(val);
            }
        }
        res.render("about", { layout: `forUsers/homePage/homeLayout`, User: req.user, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user) });
    });

}

exports.GET_visitorAbout = function(req, res, next) {
    function loadAboutGuest(req, res) {
        res.render("about", { layout: "forVisitors/homePage/homeLayout" });
    }

    (!req.user) ? loadAboutGuest(req, res) : next();
}

/* First time setup */

//Country and postal code setup
exports.GET_first_Setup_CountryandPostal = function(req, res, next) {
    //Only run when both oare n/a (The user's first time)
    if ((req.user.country === `n/a`) && (req.user.postalCode === `n/a`)) {
        res.render(`forUsers/firstSetup/getCountryandPostal`, { errors: [],User: req.user, selectCountry: require(`../arrayList/arrays`).countryList });
    }
    else{
        res.redirect(`/users/first_time_setup_profile`);
    }
};

//Profile setup
exports.GET_first_Setup_Profile = function(req, res, next) {
    //Only run on user's very first login
    if ((req.user.emailDisplay === `n/a`) && (req.user.occupation.length === 0)) {
        console.log(`Setup Profile log ${req.user.occupation.length}`);
        //load occupation array
        let occupationList = require("../arrayList/arrays").occupationList();
        res.render(`forUsers/firstSetup/setupProfile`, { errors: [], User: req.user, occupationList });
    }
    else {
        res.redirect(`/users/first_time_setup_avatar`);
    }
};

//Website link first time setup
exports.GET_first_Setup_Link = function(req, res, next) {

    //Produces an array
    Website.find({ owner: req.user._id }).exec((err, websites)=> {
        if (websites.length === 0) {
            res.render(`forUsers/firstSetup/setupLink`, {errors: [], User: req.user});
        }
        else {
            res.redirect("/");
        }
    });

};

/* Home Page */

//Home Page Route toFix
exports.renderHome = function(req, res, next) {

    //First time setup will run if params are n/a
    if ( (req.user.country === "n/a") || (req.user.emailDisplay === "n/a") ) {
        res.redirect(`/users/first_time_setup`);
    }
    //Proceed Normally
    else {
        let { style, technologies, colors, country } = req.query;
        renderDiscover(req, res, "new", {date: -1}, { style, technologies, colors, country });
    }

};

//Check if user
exports.checkHome = function(req, res, next) {

    if (!req.user) {
        let { style, technologies, colors, country } = req.query;
        discoverVisitor(req, res, "new", {date: -1}, { style, technologies, colors, country });
    }

    else {
        next();
    }

}

//Discover new
exports.GET_discover_new = function(req, res, next) {

    let { style, technologies, colors, country } = req.query;
    renderDiscover(req, res, "new", {date: -1}, { style, technologies, colors, country });

};

exports.GET_visitorNew = function (req, res, next) {

    if (!req.user) {
        let { style, technologies, colors, country } = req.query;
        discoverVisitor(req, res, "new", {date: -1}, { style, technologies, colors, country });
    }
    else {
        next();
    }

}

//Discover Highest rated
exports.GET_discover_highestRated = function(req, res, next) {

    let { style, technologies, colors, country } = req.query;

    renderDiscover(req, res, "highest_rated", {likes: -1}, { style, technologies, colors, country });
};

//Visitor Highest Rated
exports.GET_visitorHighestRated = function (req, res, next) {

    if (!req.user) {
        let { style, technologies, colors, country } = req.query;

        discoverVisitor(req, res, "highest_rated", {likes: -1}, { style, technologies, colors, country });
    }
    else {
        next();
    }

}

//Discover Highest Views
exports.GET_discover_mostViewed = function(req, res, next) {

    let { style, technologies, colors, country } = req.query;

    renderDiscover(req, res, "most_viewed", {views: -1}, { style, technologies, colors, country });
};

exports.GET_visitorMostViewed = function (req, res, next) {
    if (!req.user) {
        let { style, technologies, colors, country } = req.query;
        discoverVisitor(req, res, "most_viewed", {views: -1}, { style, technologies, colors, country });
    }
    else {
        next();
    }
}

//Favorites Render
exports.GET_favorites = function(req, res, next) {

    let { style, technologies, colors, country } = req.query;

    renderDiscover(req, res, "favorites", {}, { style, technologies, colors, country });
}

/* Pagination  */

//Next
exports.POST_newQryNext = function(req, res, next) {

    let { pageSection, style, technologies, colors, country, pageNumber } = req.body;
    res.redirect(`/discover/${pageSection}?style=${style}&technologies?=${technologies}&colors?=${colors}&country=${country}&page=${(parseInt(pageNumber)  - 1)}`); //toFix: Backing from the first page results to an error

}

//Back
exports.POST_newQryPrev = function(req, res, next) {

    let { pageSection, style, technologies, colors, country, pageNumber } = req.body;

    res.redirect(`/discover/${pageSection}?style=${style}&technologies?=${technologies}&colors?=${colors}&country=${country}&page=${(parseInt(pageNumber)  - 1)}`); //toFix: Backing from the first page results to an error
}

/* Friends Display*/

//toFix
exports.GET_discover_friends = function(req, res, next) { //error in pageination  page=2 toFix
res.send("Hazah");
};

exports.POST_friendsQryNext = function(req, res, next) {
    res.redirect(`/discover/friends?filter=${req.body.filter}&page=${(parseInt(req.body.pageNumber)  + 1)}`);
}

exports.POST_friendsQryPrev = function(req, res, next) {
    res.redirect(`/discover/friends?filter=${req.body.filter}&page=${(parseInt(req.body.pageNumber)  - 1)}`); //toFix: Backing from the first page results to an error
}

/* Search Page */

//Search home
exports.GET_search_home = [
    //Validate
    body(`q`).trim(),
    //Sanitize
    sanitizeBody(`q`).unescape(),
    (req, res, next) => {
        //Populate User
        
        //Get rid of spaces
        let searchQry = req.query.q.replace(/\s/g,'').toLowerCase();

        //Search Algorithm
        async.parallel({

            qryOne: (cb) => {
                User.find({ "fullName": searchQry }).populate(`friendRequests`).exec(cb);
            },
            qryTwo: (cb) => {
                User.find({"firstName":searchQry}).populate(`friendRequests`).exec(cb);
            },
            qryThree: (cb) => {
                User.find({"lastName":searchQry}).populate(`friendRequests`).exec(cb);
            },
            qryFour: (cb) => {
                User.find({"email":searchQry}).populate(`friendRequests`).exec(cb);
            },
            qryFive: (cb) => {
                User.find({"username":req.query.q}).populate(`friendRequests`).exec(cb); //Case sensitive Search
            },
            qrySix: (cb) => {
                Website.find({"style": searchQry}).populate("owner").populate(`friendRequests`).exec(cb);
            }

        }, function(err, results) {

            if (err) {return next(err);}      

            let qryFor = req.query.q.charAt(0).toUpperCase() + req.query.q.slice(1)

            //
            if (results.qryOne.length !== 0) {
                console.log(`qryOne`);
                res.render(`forUsers/searchPage`, {qUsers: results.qryOne, User: req.user, qryFor});
                return;
            }

            if (results.qryTwo.length !== 0) {
                console.log(`qry2`);
                res.render(`forUsers/searchPage`, {qUsers: results.qryTwo, User: req.user, qryFor});
                return;
            }

            if (results.qryThree.length !== 0) {
                console.log(`qry3`);
                res.render(`forUsers/searchPage`, {qUsers: results.qryThree, User: req.user, qryFor});
                return;
                }

            if (results.qryFour.length !== 0) {
                console.log(`qry4`);
                res.render(`forUsers/searchPage`, {qUsers: results.qryFour, User: req.user, qryFor});
                return;
            }

            if (results.qryFive.length !== 0) {
                console.log(`qry5`);
                res.render(`forUsers/searchPage`, {qUsers: results.qryFive, User: req.user, qryFor});
                return;
            }

            if (results.qrySix.length !== 0) {
                console.log(`qry6`);
                res.render(`forUsers/searchPage`, {qUsers: results.qrySix, User: req.user, qryFor});
                return;
            }

            else {
                console.log(`qryNoResult`);
                res.render(`forUsers/searchPage`, {qUsers: [], User: req.user, qryFor});
                return;
            }
        });
    }
];

//Visitor Search
exports.GET_visitorSearch = [

body(`q`).trim(),

sanitizeBody(`q`).unescape(),
(req, res, next) => {

    if (!req.user) {

        //Get rid of spaces
    let searchQry = req.query.q.replace(/\s/g,'').toLowerCase();

    //Search Algorithm
    async.parallel({

        qryOne: (cb) => {
            User.find({ "fullName": searchQry }).populate(`friendRequests`).exec(cb);
        },
        qryTwo: (cb) => {
            User.find({"firstName":searchQry}).populate(`friendRequests`).exec(cb);
        },
        qryThree: (cb) => {
            User.find({"lastName":searchQry}).populate(`friendRequests`).exec(cb);
        },
        qryFour: (cb) => {
            User.find({"email":searchQry}).populate(`friendRequests`).exec(cb);
        },
        qryFive: (cb) => {
            User.find({"username":req.query.q}).populate(`friendRequests`).exec(cb); //Case sensitive Search
        },
        qrySix: (cb) => {
            Website.find({"style": searchQry}).populate("owner").populate(`friendRequests`).exec(cb);
        }

    }, function(err, results) {

        if (err) {return next(err);}      

        let qryFor = req.query.q.charAt(0).toUpperCase() + req.query.q.slice(1)

        //
        if (results.qryOne.length !== 0) {
            console.log(`qryOne`);
            res.render(`forVisitors/searchPage`, {qUsers: results.qryOne, qryFor});
            return;
        }

        if (results.qryTwo.length !== 0) {
            console.log(`qry2`);
            res.render(`forVisitors/searchPage`, {qUsers: results.qryTwo, qryFor});
            return;
        }

        if (results.qryThree.length !== 0) {
            console.log(`qry3`);
            res.render(`forVisitors/searchPage`, {qUsers: results.qryThree, qryFor});
            return;
            }

        if (results.qryFour.length !== 0) {
            console.log(`qry4`);
            res.render(`forVisitors/searchPage`, {qUsers: results.qryFour, qryFor});
            return;
        }

        if (results.qryFive.length !== 0) {
            console.log(`qry5`);
            res.render(`forVisitors/searchPage`, {qUsers: results.qryFive, qryFor});
            return;
        }

        if (results.qrySix.length !== 0) {
            console.log(`qry6`);
            res.render(`forVisitors/searchPage`, {qUsers: results.qrySix, qryFor});
            return;
        }

        else {
            console.log(`qryNoResult`);
            res.render(`forVisitors/searchPage`, {qUsers: [], qryFor});
            return;
        }
    });
    }

    else {
        next();
    }
}
]

/* Settings render */
exports.GET_settings = function(req, res, next) {
    //render setting page with friendStat
    function renderSettings(settingTab, arrayExtra = []) {

        //
        async.parallel({

            friends: (cb)=> {
                FriendStatus.find({ requestTo: req.user._id }).populate("requestFrom").exec(cb);
            },
            websites: (cb)=> {
                Website.find({ owner: req.user._id }).exec(cb);
            }

        }, (err, async)=> {
            if (err) {return next(err);}

            let fStatDisplay = [];
            
    
            for (let val of async.friends) {
                if (val.status === 1) {
                    fStatDisplay.push(val);
                }
                else {
                            
                }
            }

            if (arrayExtra.length > 0) {
                res.render(`forUsers/settings/${settingTab}`, { occupation: arrayExtra, Websites: [], layout: `forUsers/homePage/homeLayout`, User: req.user, errors: [], friendRequests: fStatDisplay, selectCountry: require(`../arrayList/arrays`).countryList});
                return;
            }

            //User has no websites
            if (async.websites.length === 0) {
                res.render(`forUsers/settings/${settingTab}`, { Websites: [], layout: `forUsers/homePage/homeLayout`, User: req.user, errors: [], friendRequests: fStatDisplay, selectCountry: require(`../arrayList/arrays`).countryList});
                return;
            }

            else {
                res.render(`forUsers/settings/${settingTab}`, { Websites: async.websites, layout: `forUsers/homePage/homeLayout`, User: req.user, errors: [], friendRequests: fStatDisplay, selectCountry: require(`../arrayList/arrays`).countryList});
                return;
            }

        });
    }

    let tab = req.query.tab;
    
    switch (tab) {
        case (undefined): 
            renderSettings("settingsProfile", require("../arrayList/arrays").occupationList());
            break;

        case (`profile`):
            renderSettings("settingsProfile", require("../arrayList/arrays").occupationList());
            break;
            
        case (`account`):
            renderSettings("settingsAccount");
            break;

        case ("website"):
            renderSettings("settingsWebsite");
            break;
    }
}


/* Initialize Functions*/
let discoverVisitor = function(req, res, pageSection, sortSetting, filter) {

    //requried vars for pagination
    const pagination = req.query.pagination ? parseInt(req.query.pagination) : 6;
    const page = req.query.page ? parseInt(req.query.page) : 1;

    //Check objects for undefined and delete
    for (let prop in filter) {
        if (filter[prop] === undefined) {
            delete filter[prop];
        }
    }
    //All undefineds are deleted
    if (filter === undefined) {
           filter = {};
    }

    async.parallel({

        websites: (cb)=> {
            Website.find(filter).populate("owner").skip((page-1) * pagination).limit(pagination).sort(sortSetting).exec(cb);
        },

        feature: (cb)=> {
            Feature.find({}).populate({ path: "website", populate: { path: "owner" } }).exec(cb);
        },

    }, function(err, async) {
        if (err) {return next(err);}

        let selected = Math.floor(Math.random()*(async.feature.length));

        //toFix queries pagination
        if (async.websites.length < 6) {
            res.render(`forVisitors/homePage/discoverRender`, { selected, feature: async.feature, moment: moment,countryArray: require(`../arrayList/arrays`).countryList, pageSection, qryNextStat: "disabled", page, filter, layout: `forVisitors/homePage/homeLayout`, webResults: async.websites,});
            return;
        }
        //
        else {
            res.render(`forVisitors/homePage/discoverRender`, { selected, feature: async.feature, moment: moment,countryArray: require(`../arrayList/arrays`).countryList, pageSection, qryNextStat: "", page, filter, layout: `forVisitors/homePage/homeLayout`, webResults: async.websites,});
            return;
        }
    });

}

let renderDiscover = function (req, res, pageSection, sortSetting, filter) {
    //requried vars for pagination
    const pagination = req.query.pagination ? parseInt(req.query.pagination) : 6;
    const page = req.query.page ? parseInt(req.query.page) : 1;

    //Check objects for undefined and delete
    for (let prop in filter) {
        if (filter[prop] === undefined) {
            delete filter[prop];
        }
    }
    //All undefineds are deleted
    if (filter === undefined) {
           filter = {};
    }

    async.parallel({

        fStat: (cb)=> {
            FriendStatus.find({"requestTo": req.user._id}).populate("requestFrom").exec(cb);
        },

        websites: (cb)=> {
            Website.find(filter).populate("owner").skip((page-1) * pagination).limit(pagination).sort(sortSetting).exec(cb);
        },

        feature: (cb)=> {
            Feature.find({}).populate({ path: "website", populate: { path: "owner" } }).exec(cb);
        },

        user: (cb)=> {
            User.findById(req.user._id).populate({ 
                path: "favorites", 
                populate: { path: "owner" } 
            }).exec(cb);
        }

    }, function(err, async) {
        if (err) {return next(err);}

        //Friend Status display
        let fStatDisplay = [];

        for (let val of async.fStat) {
            if (val.status === 1) {
                fStatDisplay.push(val);
            }
        }

        let selected = Math.floor(Math.random()*(async.feature.length));

        //Render Favorites
        if (pageSection === "favorites") {
            console.log(async.user.favorites);
            //toFix queries pagination
            if (req.user.favorites.length < 6) {
                res.render(`forUsers/homePage/discoverRender`, { selected, feature: async.feature, moment: moment, countryArray: require(`../arrayList/arrays`).countryList,pageSection ,qryNextStat: "disabled", page, filter, layout: `forUsers/homePage/homeLayout`, User: req.user, webResults: async.user.favorites, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                return;
            }
            //
            else {
                res.render(`forUsers/homePage/discoverRender`, { selected, feature: async.feature, moment: moment,countryArray: require(`../arrayList/arrays`).countryList, pageSection ,qryNextStat: "", page, filter, layout: `forUsers/homePage/homeLayout`, User: req.user, webResults: async.user.favorites, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                return;
            }
        }
        
        //toFix queries pagination
        if (async.websites.length < 6) {
            res.render(`forUsers/homePage/discoverRender`, { selected, feature: async.feature, moment: moment, countryArray: require(`../arrayList/arrays`).countryList,pageSection ,qryNextStat: "disabled", page, filter, layout: `forUsers/homePage/homeLayout`, User: req.user, webResults: async.websites, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
            return;
        }
        //
        else {
            res.render(`forUsers/homePage/discoverRender`, { selected, feature: async.feature, moment: moment,countryArray: require(`../arrayList/arrays`).countryList, pageSection ,qryNextStat: "", page, filter, layout: `forUsers/homePage/homeLayout`, User: req.user, webResults: async.websites, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
            return;
        }
    });
}

/* */