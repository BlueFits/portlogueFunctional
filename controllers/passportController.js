const passport = require(`passport`);
const mongoose = require(`mongoose`);

const User = require(`../models/User`);

exports.loginUser = function(req, res, next) {

    passport.authenticate(`local`, {
        //Forced Redirect into either First time setup or home page
        successRedirect: `/`,
        failureRedirect: `/users/login`,
        failureFlash: true

    })(req, res, next);

};

exports.logoutUser = function(req, res, next) {
    req.logout();
    req.flash(`success`, `You are logged out`);
    res.redirect(`/users/login`);
}