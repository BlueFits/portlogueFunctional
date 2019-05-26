const requiredObjects = require(`../objecList/objects`);
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require(`async`);



//Models
const User = require(`../models/User`);

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
    User.findOne({"username":req.params.username}).populate(`viewedPortfolios`).exec((err, result)=> {
        if (err) throw "routeController > GET_profile";

        if (!result) {
            res.send(`NO USERNAME`); //toFix
        }

        else {  

            if (req.user.username === result.username) {
                console.log(`Bypass record of history`);
                res.render(`profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: result, User: req.user}); //toFix Render Profile instead
                return;
            }

            else {

                let userCheck = false;

                for (let val of req.user.viewedPortfolios) {
                    if (val.toString() === result._id.toString()) {
                        userCheck = true;
                    }
                }

                if (userCheck === true) {
                    res.render(`profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: result, User: req.user});
                    return;
                }
                
                else {
                    let user = new User({
                        _id: req.user._id,
                        viewedPortfolios: req.user.viewedPortfolios
                    });
        
                    user.viewedPortfolios.push(result._id);
        
                    User.findByIdAndUpdate(req.user._id, user, {}, function(err, results) {
                        if (err) {return next(err);}

                        res.render(`profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: result, User: req.user});

                    });  
                }
            }                    
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



//Home Page Route

exports.renderHome = function(req, res, next) {
    //Check for first time users
    User.findById(req.user._id).exec(function(err, result) {

        if (err) {return next(err);}

        //First time setup will run if params are not set
        if ( (result.country === 'NOT SET') && (result.emailDisplay === `NOT SET`) && (result.postalCode === `NOT SET`) && (result.portfolioUrl === `NOT SET`) ) {
            res.redirect(`/users/first_time_setup`);
        }

        //Proceed Normally
        else {
            pullCollection.exec((err, results)=> {
                if (err) throw `routeController > GET_discover_new`;

                res.render(`homePage/homeNew`, {layout: `homePage/homeLayout`, User: req.user, qUsers: results, userHistory: functionCntrl.userHistory(req.user)});
                return;
            })
        }
    });
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
    res.redirect(`/`);
};



/* GET home page */
exports.GET_discover_new = function(req, res, next) {

    pullCollection.exec((err, results)=> {
        if (err) throw `routeController > GET_discover_new`;
        res.render(`homePage/homeNew`, {layout: `homePage/homeLayout`, User: req.user, qUsers: results, userHistory: functionCntrl.userHistory(req.user)});
        return;
    })
};

exports.GET_discover_highestRated = function(req, res, next) {

    pullCollection.exec((err, results)=> {

        let toDisplay = results.sort((a,b)=> { return b.portfolioLikes - a.portfolioLikes;});
        res.render(`homePage/homeHighestRated`, {layout: `homePage/homeLayout`, qUsers: toDisplay, User:req.user, userHistory: functionCntrl.userHistory(req.user)});

    });

};

exports.GET_discover_mostViewed = function(req, res, next) {

    pullCollection.exec((err, results)=> {

        let toDisplay = results.sort((a,b)=> { return b.portfolioViews - a.portfolioViews;});
        res.render(`homePage/homeHighestRated`, {layout: `homePage/homeLayout`, qUsers: toDisplay, User:req.user, userHistory: functionCntrl.userHistory(req.user)});

    });

};

exports.GET_discover_suggestions = function(req, res, next) {
    
    res.render(`homePage/homeSuggestions`, {layout: `homePage/homeLayout`, User: req.user, userHistory: functionCntrl.userHistory(req.user)}); //toFix
};

exports.GET_discover_friends = function(req, res, next) {
    
    User.findById(req.user._id).populate(`friendList`).exec((err, result)=> {
        res.render(`homePage/homeFriends`, {layout: `homePage/homeLayout`, User: result, userHistory: functionCntrl.userHistory(req.user)}); //toFix
    })
};

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

            //
            if (results.qryOne.length !== 0) {
                console.log(`qryOne`);
                res.render(`searchPage`, {qUsers: results.qryOne, User: req.user, qryFor: req.query.q});
                return;
            }

            if (results.qryTwo.length !== 0) {
                console.log(`qry2`);
                res.render(`searchPage`, {qUsers: results.qryTwo, User: req.user, qryFor: req.query.q});
                return;
            }

            if (results.qryThree.length !== 0) {
                console.log(`qry3`);
                res.render(`searchPage`, {qUsers: results.qryThree, User: req.user, qryFor: req.query.q});
                return;
                }

            if (results.qryFour.length !== 0) {
                console.log(`qry4`);
                res.render(`searchPage`, {qUsers: results.qryFour, User: req.user, qryFor: req.query.q});
                return;
            }

            if (results.qryFive.length !== 0) {
                console.log(`qry5`);
                res.render(`searchPage`, {qUsers: results.qryFive, User: req.user, qryFor: req.query.q});
                return;
            }

            if (results.qrySix.length !== 0) {
                console.log(`qry6`);
                res.render(`searchPage`, {qUsers: results.qrySix, User: req.user, qryFor: req.query.q});
                return;
            }

            else {
                console.log(`qryNoResult`);
                res.render(`searchPage`, {qUsers: [], User: req.user, qryFor: req.query.q});
                return;
            }
        });
    }
];



//Initialize Functions
const pullCollection = User.find({});