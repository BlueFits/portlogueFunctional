const requiredObjects = require(`../objecList/objects`);

const User = require(`../models/User`);

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

}

//GET function for first time setup
exports.GET_first_Setup_CountryandPostal = function(req, res, next) {
    //Pulls from array list
    res.render(`firstSetup/getCountryandPostal`, {errors: [],User: req.user, selectCountry: require(`../arrayList/arrays`).countryList});
}