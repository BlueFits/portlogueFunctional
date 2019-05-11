const passport = require(`passport`);

exports.loginUser = function(req, res, next) {

    passport.authenticate(`local`, {

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