const requiredObjects = require(`../objecList/objects`);
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require(`async`);

const User = require(`../models/User`);

/* Start of route Functions */


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
            res.send(`NO IMAGES FOUND`);
        }
    });

};

//Email redirect
exports.redirectEmail = function(req, res, next) {
    User.findOne({"email": req.params.email}).exec((err, results)=>{
        if (err) throw "routeController-redirectEmail";

        if (!results) {
            res.send(`USER NOT FOUND`);
        }

        else {
            res.redirect(`/users/profile/${results.username}`);
        }

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
    User.findOne({"email":req.user.email}).exec(function(err, results) {

        if (err) {return next(err);}

        //First time setup will run if params are not set
        if ( (results.country === 'NOT SET') && (results.emailDisplay === `NOT SET`) && (results.postalCode === `NOT SET`) && (results.portfolioUrl === `NOT SET`) ) {
            res.redirect(`/users/first_time_setup`);
        }

        //Proceed Normally
        else {
            User.find({}).exec((err, results)=> {
                if (err) throw `routeController > GET_discover_new`;
                res.render(`homePage/homeNew`, {layout: `homePage/homeLayout`, User: req.user, qUsers: results});
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

    User.find({}).exec((err, results)=> {
        if (err) throw `routeController > GET_discover_new`;
        res.render(`homePage/homeNew`, {layout: `homePage/homeLayout`, User: req.user, qUsers: results});
        return;
    })
};

exports.GET_discover_highestRated = function(req, res, next) {

    User.find({}).exec((err, results)=> {

        let toDisplay = results.sort((a,b)=> { return b.portfolioLikes - a.portfolioLikes;});
        res.render(`homePage/homeHighestRated`, {layout: `homePage/homeLayout`, qUsers: toDisplay, User:req.user});

    });

};

exports.GET_discover_mostViewed = function(req, res, next) {

    User.find({}).exec((err, results)=> {

        let toDisplay = results.sort((a,b)=> { return b.portfolioViews - a.portfolioViews;});
        res.render(`homePage/homeHighestRated`, {layout: `homePage/homeLayout`, qUsers: toDisplay, User:req.user});

    });

};

exports.GET_discover_suggestions = function(req, res, next) {
    //To be implemented
    res.render(`homePage/homeSuggestions`, {layout: `homePage/homeLayout`, User: req.user});
};

exports.GET_discover_friends = function(req, res, next) {
    //res.render(`homePage/homeFriends`, {layout: `homePage/homeLayout`, User: req.user});
    //To be implemented
    res.send(JSON.stringify(req.user.friendList));
};

//Search home
exports.GET_search_home = [
    //Validate
    body(`q`).trim(),
    //Sanitize
    sanitizeBody(`q`).unescape(),
    (req, res, next) => {
        //Get rid of spaces
        let searchQry = req.query.q.replace(/\s/g,'').toLowerCase();

        //Search Algorithm
        async.parallel({

            qryOne: (cb) => {
                User.find({ "fullName": searchQry }).exec(cb);
            },
            qryTwo: (cb) => {
                User.find({"firstName":searchQry}).exec(cb);
            },
            qryThree: (cb) => {
                User.find({"lastName":searchQry}).exec(cb);
            },
            qryFour: (cb) => {
                User.find({"email":searchQry}).exec(cb);
            },
            qryFive: (cb) => {
                User.find({"username":req.query.q}).exec(cb); //Case sensitive Search
            },
            qrySix: (cb) => {
                User.find({"portfolioType": req.query.q}).exec(cb);
            }

        }, function(err, results) {

            if (err) {return next(err);}

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