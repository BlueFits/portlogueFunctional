module.exports = {
    ensureAuth: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash(`error_msg`, `Login required`);
        res.redirect(`/users/login`);
    },
    ensureAuthHome: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        //No flash on home page
        res.redirect(`/users/login`);
    }
}