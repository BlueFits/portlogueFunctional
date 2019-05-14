const requiredObjects = require(`../objecList/objects`);

const User = require(`../models/User`);

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

//Login Route

exports.renderLogin = function(req, res, next) {
    res.render(`login`);
};

//Register Route

exports.renderRegister = function(req, res, next) {
    res.render(`register`, {layout: `homePage/homeLayout`, User: req.user});
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
            res.render(`homePage/homeNew`, {layout: `homePage/homeLayout`, User: req.user});
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
}

exports.GET_discover_new = function(req, res, next) {
    res.render(`homePage/homeNew`, {layout: `homePage/homeLayout`, User: req.user});
}

exports.GET_discover_highestRated = function(req, res, next) {
    res.render(`homePage/homeHighestRated`, {layout: `homePage/homeLayout`, User: req.user});
}