const requiredObjects = require(`../objecList/objects`);
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require(`async`);



//Models
const User = require(`../models/User`);
const FriendStatus = require(`../models/friendStatus`);
const Token = require(`../models/Token`);

//Functions
const functionCntrl = require(`../controllers/functionsContoller`);

//GET user web thumb 
exports.GET_webthumb =  function(req, res, next) {

    User.findOne({"email":req.params.email}).exec((err, result) => {
        if (err) {return next(err);}
        
        if (result) {
            res.contentType(result.portfolioImg.contentType);
            res.send(result.portfolioImg.data);
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
    //record user history
    User.findOne({"username":req.params.username}).populate(`viewedPortfolios`).exec((err, profileRes)=> {
        if (err) throw "routeController > GET_profile";

        if (!profileRes) {
            res.send(`NO USERNAME`); //toFix
        }

        else {  
            //Save user history && Render Friend Status
            async.parallel({

                one: (cb)=> {
                    FriendStatus.findOne({"requestFrom": req.user, "requestTo": profileRes._id}).exec(cb);
                },
                two: (cb)=> {
                    FriendStatus.findOne({"requestFrom": profileRes._id, "requestTo": req.user}).exec(cb);
                }

            }, function(err, asyncResult) {

                let friendVal = {};
                let userCheck = false;
                let likeFunction = {};

                for (let val of req.user.viewedPortfolios) {
                    if (val.toString() === profileRes._id.toString()) {
                        userCheck = true;
                    }
                }

                //Check if its user profile
                if (req.user.username === profileRes.username) {
                    friendVal = {val: `Account Settings`, url: `/users/settings`, class: ``};

                    likeFunction.status = `disabled`;

                    res.render(`profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: profileRes, User: req.user, friendVal, likeFunction}); //toFix Render Profile instead);
                    return;
                }

                //User to qUser
                if (asyncResult.one) {
                    switch (asyncResult.one.status) {
                        case 1:
                            friendVal = {val: `Request Sent`, url: ``, class:`href-disabled`};
                            break;
                        case 2:
                            friendVal = {val: `Friends`, url: `/`, class:`href-disabled`};
                            break;
                        case 3:
                            friendVal = {val: `Request Rejected`, url: `/`, class:`href-disabled`};
                            break;
                    }

                    functionCntrl.renderHomeFilter(next, req, res, profileRes, User, friendVal, userCheck, likeFunction);
                    return;
                }

                //qUser from User
                if (asyncResult.two) {
                    switch (asyncResult.two.status) {
                        case 1:
                            friendVal = {val: `Respond To Request`, url: `/users/notifications/${profileRes._id}`, class:``};
                            break;
                        case 2:
                            friendVal = {val: `Friends`, url: `/`, class:`href-disabled`};
                            break;
                        case 3:
                            friendVal = {val: `Request Rejected`, url: `/`, class:`href-disabled`};
                            break;
                    }

                    functionCntrl.renderHomeFilter(next, req, res, profileRes, User, friendVal, userCheck, likeFunction);
                    return;

                }

                if ((!asyncResult.one) || (!asyncResult.two)) {
                    console.log(`async no result one`);
                    friendVal = {val: `Add Friend`, url: `/users/add_friend/${profileRes._id}`, class: ``};
                    functionCntrl.renderHomeFilter(next, req, res, profileRes, User, friendVal, userCheck, likeFunction);
                    return;
                }
            });           
        }
    });
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
    //Only run when both oare not set (The user's first time)
    if ((req.user.country ===`NOT SET`) && (req.user.postalCode === `NOT SET`)) {
        res.render(`firstSetup/getCountryandPostal`, { errors: [],User: req.user, selectCountry: require(`../arrayList/arrays`).countryList });
    }
    else{
        res.redirect(`/users/first_time_setup_profile`);
    }
};

exports.GET_first_Setup_Profile = function(req, res, next) {
    //Only run on user's very first login
    if ((req.user.emailDisplay === `NOT SET`) && (req.user.occupation === `NOT SET`)) {
        res.render(`firstSetup/setupProfile`, { errors: [], User: req.user });
    }
    else {
        res.redirect(`/users/first_time_setup_avatar`);
    }
};

exports.GET_first_Setup_Link = function(req, res, next) {
    //Only run on user's very first login
    if ((req.user.portfolioUrl === `NOT SET`) && (req.user.portfolioType === `NOT SET`)) {
        res.render(`firstSetup/setupLink`, {errors: [], User: req.user});
    }

    else {
        res.redirect(`/`);
    }
};

//Home Page Route
exports.renderHome = function(req, res, next) {
    //Check for first time users
    User.findById(req.user._id).exec(function(err, result) {

        if (err) {return next(err);}

        //First time setup will run if params are not set
        if ( (result.country === 'NOT SET') || (result.emailDisplay === `NOT SET`) ) {
            res.redirect(`/users/first_time_setup`);
        }

        //Proceed Normally
        else {
            renderDiscover(req, res, "new", {dateJoined: -1});
        }
    });
};

/* discover new */
exports.GET_discover_new = function(req, res, next) {
    renderDiscover(req, res, "new",{dateJoined: -1});
};

exports.POST_newQryNext = function(req, res, next) {
    res.redirect(`/discover/${req.body.pageSection}?filter=${req.body.filter}&page=${(parseInt(req.body.pageNumber)  + 1)}`);
}

exports.POST_newQryPrev = function(req, res, next) {
    res.redirect(`/discover/${req.body.pageSection}?filter=${req.body.filter}&page=${(parseInt(req.body.pageNumber)  - 1)}`); //toFix: Backing from the first page results to an error
}

//Discover Highest rated
exports.GET_discover_highestRated = function(req, res, next) {
    renderDiscover(req, res, "highest_rated", {portfolioLikes: -1});
};

//Discover Highest Views
exports.GET_discover_mostViewed = function(req, res, next) {
    renderDiscover(req, res, "most_viewed", {portfolioViews: -1});
};



//Suggestions omit for build
/*
exports.GET_discover_suggestions = function(req, res, next) {
    
    res.render(`homePage/homeSuggestions`, {layout: `homePage/homeLayout`, User: req.user, userHistory: functionCntrl.userHistory(req.user)}); //toFix
};

*/

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
                User.find({"portfolioType": searchQry}).populate(`friendRequests`).exec(cb);
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

            res.sendStatus(404 + " Error at GET_confirmation ");
        }

        else {
            User.findById(result._userId._id).exec((err, userRes)=> {
                if (err) {return next(err);}
    
                let userUpdate = new User({
                    _id: userRes._id,
                    isVerified: true
                });
    
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

//Initialize Functions
let renderDiscover = function (req, res, pageSection, sortSetting) {

    //requried vars for pagination
    const pagination = req.query.pagination ? parseInt(req.query.pagination) : 6;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const filterQry = req.query.filter ? {portfolioType: req.query.filter} : {};

    User.find(filterQry).skip((page-1) * pagination).limit(pagination).sort(sortSetting).exec((err, results)=> {
        if (err) throw `routeController > GET_discover_new`;

        FriendStatus.find({"requestTo": req.user._id}).populate(`requestFrom`).exec((err, fstatRes)=> {
            if (err) {
                console.log(`renderHome> fstatRes`) 
                return next(err);
            }
            //Filter active users from inactive users
            let qUsers = functionCntrl.filterStatus(results);


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
                if (results.length < 6) {
                    res.render(`homePage/discoverRender`, {pageSection ,qryNextStat: "disabled", page, filter: filterQry.portfolioType, layout: `homePage/homeLayout`, User: req.user, qUsers, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                    return;
                }
                //
                res.render(`homePage/discoverRender`, { pageSection ,qryNextStat: "", page, filter: filterQry.portfolioType, layout: `homePage/homeLayout`, User: req.user, qUsers, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                return;
            }

            else {

                if (results.length < 6) {
                    res.render(`homePage/discoverRender`, {pageSection, qryNextStat: "disabled", page, filter: filterQry.portfolioType, layout: `homePage/homeLayout`, User: req.user, qUsers, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                    return;
                }

                res.render(`homePage/discoverRender`, {pageSection, qryNextStat: "", page, layout: `homePage/homeLayout`, filter: filterQry.portfolioType, User: req.user, qUsers, friendRequests: fStatDisplay, userHistory: functionCntrl.userHistory(req.user)});
                return;
            }
        });
    })

}