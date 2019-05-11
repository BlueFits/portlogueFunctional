const requiredObjects = require(`../objecList/objects`);

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
    res.render(`dashboard`, {User: req.user});
}
