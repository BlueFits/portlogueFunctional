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
            res.render(`dashboard`, {User: req.user});
        }

    });

};

//GET function for first time setup
exports.GET_first_Setup_CountryandPostal = function(req, res, next) {
    //Pulls from array list
    res.render(`firstSetup/getCountryandPostal`, { errors: [],User: req.user, selectCountry: require(`../arrayList/arrays`).countryList });

};

exports.GET_first_Setup_Profile = function(req, res, next) {
    res.render(`firstSetup/setupProfile`, { errors: [], User: req.user });
};

exports.GET_first_Setup_Avatar = function(req, res, next) {
    res.render(`firstSetup/setupAvatar`, { errors:[], User: req.user, avatar: `/assets/avatars/placeholder.png`});
};

exports.GET_first_Setup_Link = function(req, res, next) {
    res.render(`firstSetup/setupLink`, {errors: [], User: req.user});
}