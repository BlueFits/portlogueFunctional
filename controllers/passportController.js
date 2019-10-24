const passport = require(`passport`);

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
    req.flash(`success`, { msg: `You are logged out` });
    res.redirect(`/`);
};