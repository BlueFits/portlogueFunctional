const requiredObjects = require(`../objecList/objects`);
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require(`async`);
const moment = require("moment");



//Models
const User = require(`../models/User`);
const FriendStatus = require(`../models/friendStatus`);
const Token = require(`../models/Token`);
const Website = require("../models/Website");

//Functions
const functionCntrl = require(`../controllers/functionsContoller`);

/* Initialize Functions*/

let renderDiscover = function (req, res, pageSection, sortSetting) {

    //requried vars for pagination
    const pagination = req.query.pagination ? parseInt(req.query.pagination) : 6;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const filterQry = req.query.filter ? {type: req.query.filter} : {};

    Website.find(filterQry).populate("owner").skip((page-1) * pagination).limit(pagination).sort(sortSetting).exec((err, webResults)=> {
        if (err) throw `routeController > GET_discover_new`;

        FriendStatus.find({"requestTo": req.user._id}).populate(`requestFrom`).exec((err, fstatRes)=> {
            if (err) {
                console.log(`renderHome> fstatRes`) 
                return next(err);
            }

            let fStatDisplay = [];

            for (let val of fstatRes) {
                if (val.status === 1) {
                    fStatDisplay.push(val);
                }
                else {
                            
                }
            }

            if (fStatDisplay.length === 0) {
                console.log(`No requests`);
                //Add a function if fStat is empty

                //toFix queries pagination
                if (webResults.length < 6) {
                    res.render(`homePage/discoverRender`, {pageSection ,qryNextStat: "disabled", page, filter: filterQry.portfolioType, layout: `homePage/homeLayout`, User: req.user, webResults, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                    return;
                }
                //
                res.render(`homePage/discoverRender`, { pageSection ,qryNextStat: "", page, filter: filterQry.portfolioType, layout: `homePage/homeLayout`, User: req.user, webResults, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                return;
            }

            else {

                if (webResults.length < 6) {
                    res.render(`homePage/discoverRender`, {pageSection, qryNextStat: "disabled", page, filter: filterQry.portfolioType, layout: `homePage/homeLayout`, User: req.user, webResults, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                    return;
                }

                res.render(`homePage/discoverRender`, {pageSection, qryNextStat: "", page, layout: `homePage/homeLayout`, filter: filterQry.portfolioType, User: req.user, webResults, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                return;
            }
        });
    })

}

/* */

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
            res.render("indivs/websiteDisplay", { moment: moment, website, owner: website.owner, user: req.user, comments: [] });
        }

        else {
            res.render("indivs/websiteDisplay", { moment: moment, website, owner: website.owner, user: req.user, comments: website.comments.reverse() });
        }

    });
}

//GET user web thumb 
exports.GET_webthumb =  function(req, res, next) {

    Website.findOne({owner: req.params.id}).exec((err, result) => {
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



//Get for messages
exports.GET_send_message = function(req, res, next) {
    res.send(`NOT IMPLEMENTED`); //toFix
}



//Email redirect
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


//Id redirect avatar
exports.idRedirect = function(req, res, next) {
    User.findById(req.params.id).exec((err, result)=> {
        res.redirect(`/publicAvatar/${result.email}`);
    });
}



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
                    res.render(`homePage/profilePage`, { profile, webResults, friendVal, qryNextStat: "disabled", page, layout: `homePage/homeLayout`, User: req.user, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                    return;
                }
                
                else {
                    res.render(`homePage/profilePage`, { profile, webResults, friendVal, qryNextStat: "", page, layout: `homePage/homeLayout`, User: req.user, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
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

//id redirect
exports.GET_id_redirect = function(req, res, next) {
    User.findById(req.params.id).exec((err, result)=> {
        if (err) {return next(err)};
        res.redirect(`/users/profile/${result.username}`);
    });
}



//Login Route
exports.renderLogin = function(req, res, next) {
    res.render(`login`, requiredObjects.registerLocals);
};

//Register Route
exports.renderRegister = function(req, res, next) {
    res.render(`register`, requiredObjects.registerLocals);
};

//GET function for first time setup
exports.GET_first_Setup_CountryandPostal = function(req, res, next) {
    //Only run when both oare n/a (The user's first time)
    if ((req.user.country === `n/a`) && (req.user.postalCode === `n/a`)) {
        res.render(`firstSetup/getCountryandPostal`, { errors: [],User: req.user, selectCountry: require(`../arrayList/arrays`).countryList });
    }
    else{
        res.redirect(`/users/first_time_setup_profile`);
    }
};

exports.GET_first_Setup_Profile = function(req, res, next) {
    //Only run on user's very first login
    if ((req.user.emailDisplay === `n/a`) && (req.user.occupation === `n/a`)) {
        res.render(`firstSetup/setupProfile`, { errors: [], User: req.user });
    }
    else {
        res.redirect(`/users/first_time_setup_avatar`);
    }
};

exports.GET_first_Setup_Link = function(req, res, next) {

    //Produces an array
    Website.find({ owner: req.user._id }).exec((err, websites)=> {
        if (websites.length === 0) {
            res.render(`firstSetup/setupLink`, {errors: [], User: req.user});
        }
        else {
            res.redirect("/");
        }
    });

};

//Home Page Route toFix
exports.renderHome = function(req, res, next) {

    //First time setup will run if params are n/a
    if ( (req.user.country === "n/a") || (req.user.emailDisplay === "n/a") ) {
        res.redirect(`/users/first_time_setup`);
    }

    //Proceed Normally
    else {
        renderDiscover(req, res, "new", {dateJoined: -1});
    }

};

/* discover new */
exports.GET_discover_new = function(req, res, next) {
    renderDiscover(req, res, "new", {date: -1});
};

exports.POST_newQryNext = function(req, res, next) {
    res.redirect(`/discover/${req.body.pageSection}?filter=${req.body.filter}&page=${(parseInt(req.body.pageNumber)  + 1)}`);
}

exports.POST_newQryPrev = function(req, res, next) {
    res.redirect(`/discover/${req.body.pageSection}?filter=${req.body.filter}&page=${(parseInt(req.body.pageNumber)  - 1)}`); //toFix: Backing from the first page results to an error
}

//Discover Highest rated
exports.GET_discover_highestRated = function(req, res, next) {
    renderDiscover(req, res, "highest_rated", {likes: -1});
};

//Discover Highest Views
exports.GET_discover_mostViewed = function(req, res, next) {
    renderDiscover(req, res, "most_viewed", {views: -1});
};

//Friends Display
exports.GET_discover_friends = function(req, res, next) { //error in pageination  page=2 toFix

    //requried vars for pagination
    const pagination = req.query.pagination ? parseInt(req.query.pagination) : 6;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const filterQry = req.query.filter ? {portfolioType: req.query.filter} : {};

        console.log("didnt run User findbyId YET for "+req.user.username+ " id:"+req.user._id);
    User.findById(req.user._id).populate(`friendList`).skip((page-1) * pagination).limit(pagination).exec((err, result)=> {
        if (err) {return next(err);}
        //
        //toFix
        if (result === null) {
            res.send("505 Error. We will fix this in a bit.");
            return;
        }

        console.log("ran User.findById " + result.username);
        FriendStatus.find({"requestTo": req.user._id}).populate(`requestFrom`).exec((err, fstatRes)=> {
            if (err) {
                console.log(`renderHome> fstatRes`) 
                return next(err);
            }

            console.log("Ran FriendStatus");

            let fStatDisplay = [];

            for (let val of fstatRes) {
                if (val.status === 1) {
                    fStatDisplay.push(val);
                }
                else {
                            
                }
            }

            if (fstatRes.length === 0) {
                console.log(`No requests`);

                //toFix quries pagination
                if (result.friendList.length < 6) {
                    console.log("nokinokie");
                    res.render(`homePage/friendsRender`, {qryNextStat: "disabled", page, layout: `homePage/homeLayout`, User: req.user, filter: filterQry.portfolioType, qUser: result.friendList, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                    return;
                }
                //
                console.log("okieokie");
                res.render(`homePage/friendsRender`, {qryNextStat: "", page, layout: `homePage/homeLayout`, User: req.user, qUser: result.friendList, filter: filterQry.portfolioType, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                return;
            }

            else {

                if (result.friendList.length < 6) {
                    console.log("nokinokie2");
                    res.render(`homePage/friendsRender`, {qryNextStat: "disabled", page, layout: `homePage/homeLayout`, User: req.user, qUser: result.friendList, filter: filterQry.portfolioType, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                    return;
                }
                console.log("okiokie2");
                res.render(`homePage/friendsRender`, {qryNextStat: "", page, layout: `homePage/homeLayout`, User: req.user, qUser: result.friendList, filter: filterQry.portfolioType, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                return;
            }
        });

        //
    })
};

exports.POST_friendsQryNext = function(req, res, next) {
    res.redirect(`/discover/friends?filter=${req.body.filter}&page=${(parseInt(req.body.pageNumber)  + 1)}`);
}

exports.POST_friendsQryPrev = function(req, res, next) {
    res.redirect(`/discover/friends?filter=${req.body.filter}&page=${(parseInt(req.body.pageNumber)  - 1)}`); //toFix: Backing from the first page results to an error
}

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

        let userId = req.user._id;

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
                Website.find({"type": searchQry}).populate("owner").populate(`friendRequests`).exec(cb);
            }

        }, function(err, results) {

            if (err) {return next(err);}      

            let qryFor = req.query.q.charAt(0).toUpperCase() + req.query.q.slice(1)

            //
            if (results.qryOne.length !== 0) {
                console.log(`qryOne`);
                res.render(`searchPage`, {qUsers: results.qryOne, User: req.user, qryFor});
                return;
            }

            if (results.qryTwo.length !== 0) {
                console.log(`qry2`);
                res.render(`searchPage`, {qUsers: results.qryTwo, User: req.user, qryFor});
                return;
            }

            if (results.qryThree.length !== 0) {
                console.log(`qry3`);
                res.render(`searchPage`, {qUsers: results.qryThree, User: req.user, qryFor});
                return;
                }

            if (results.qryFour.length !== 0) {
                console.log(`qry4`);
                res.render(`searchPage`, {qUsers: results.qryFour, User: req.user, qryFor});
                return;
            }

            if (results.qryFive.length !== 0) {
                console.log(`qry5`);
                res.render(`searchPage`, {qUsers: results.qryFive, User: req.user, qryFor});
                return;
            }

            if (results.qrySix.length !== 0) {
                console.log(`qry6`);
                res.render(`searchPage`, {qUsers: results.qrySix, User: req.user, qryFor});
                return;
            }

            else {
                console.log(`qryNoResult`);
                res.render(`searchPage`, {qUsers: [], User: req.user, qryFor});
                return;
            }
        });
    }
];


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

exports.GET_settings = function(req, res, next) {
    //render setting page with friendStat
    function renderSettings(settingTab) {
        FriendStatus.find({"requestTo": req.user._id}).populate(`requestFrom`).exec((err, fstatRes)=> {
            if (err) {
                console.log(`renderHome > fstatRes`) 
                return next(err);
            }
            //Filter active users from inactive users
    
            let fStatDisplay = [];
    
            for (let val of fstatRes) {
                if (val.status === 1) {
                    fStatDisplay.push(val);
                }
                else {
                            
                }
            }
    
            if (fStatDisplay.length === 0) {
                console.log(`No requests`);
                //Add a function if fStat is empty
                res.render(`settings/${settingTab}`, {layout: `homePage/homeLayout`, User: req.user, errors: [], friendRequests: fStatDisplay, selectCountry: require(`../arrayList/arrays`).countryList});
                return;
            }
    
            else {
                res.render(`settings/${settingTab}`, {layout: `homePage/homeLayout`, User: req.user, errors: [], friendRequests: fStatDisplay, selectCountry: require(`../arrayList/arrays`).countryList});
                return;
            }
        });
    }

    let tab = req.query.tab;
    console.log(tab);
    switch (tab) {
        case (undefined): 
            renderSettings("settingsProfile");
            break;

        case (`profile`):
            renderSettings("settingsProfile");
            break;
            
        case (`account`):
            renderSettings("settingsAccount");
            break;
    }
}

//About page
exports.GET_aboutPage = function(req, res, next) {
    res.render("homePage/portlogue-about", {layout: "visitorLayout"});
}