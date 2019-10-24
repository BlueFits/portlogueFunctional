exports.guestGenerate = function (req, res, next) {
    //Modules
    const requestIp = require("request-ip");
    const geoip = require("geoip-lite");
    //Model
    const Guest = require("../models/Guest");


    const clientIp = requestIp.getClientIp(req);
    const geo = geoip.lookup(clientIp);

    console.log(clientIp);

    if (clientIp === "::1" || clientIp === "::ffff:127.0.0.1") {
        console.log(`-----------------You are in development mode---------------------`);
        next();
    }
    else {
        let guestInstance = new Guest({
            ip: clientIp,
            country: geo.country || "n/a",
            region: geo.region || "n/a",
            city: geo.city || "n/a",
            timezone: geo.timezone || "n/a",
            referredFrom: req.get("Referrer") || "n/a"
        });

        Guest.findOne({ ip: clientIp }).exec((err, result)=> {

            if (err) {return next(err);}

            if (result) {
                console.log("Visiting User");
                next();
            }

            else {
                guestInstance.save((err)=> {
                    if (err) {return next(err);}
                    next();
                });
            }
        });
    }
}

exports.isEmpty = function(object) {
    for (let val in object) {
        if (object.hasOwnProperty(val)) {
            return false;
        }
    }
    return true;
}

exports.userHistory = function(reqUser) {

    let displayControl = [];
    let history = [];

                for (let val of reqUser.viewedSites) {
                    displayControl.push(val);
                }

                displayControl = displayControl.reverse();

                for (let i = 0; i < 8; i++) {
                    history.push(displayControl[i]);
                }

                return history.filter(Boolean);

}

exports.renderHomeFilter = function(next, req, res, profileRes, User, friendVal, userCheck, likeFunction) {

    likeFunction.status = "";

    if (userCheck === true) {
        console.log(`Profile already saved`);
        res.render(`forUsers/profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: profileRes, User: req.user, friendVal, likeFunction});
    }

    else {
        let user = new User({
            _id:req.user._id,
            status: req.user.status,
            likedPortfolios: req.user.likedPortfolios,
            viewedPortfolios: req.user.viewedPortfolios,
            friendList: req.user.friendList,
            dateJoined: req.user.dateJoined
        });

        user.viewedPortfolios.push(profileRes._id);

        User.findByIdAndUpdate(req.user._id, user, {}, (err, result)=> {
            if (err) {return next(err);}
            //

            let pRes = new User({
                _id: profileRes._id,
                status: profileRes.status,
                portfolioViews: profileRes.portfolioViews + 1,
                dateJoined: profileRes.dateJoined
            });

            User.findByIdAndUpdate(profileRes._id, pRes, {}, (err, updateRes)=> {
                if (err) {return next(err);}
                res.render(`forUsers/profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: profileRes, User: req.user, friendVal, likeFunction});
            });
            //
        });
    }
}

exports.filterStatus = function(results) {
    let qUsers = [];

    for (val of results) {
        if (val.status === "active") {
            qUsers.push(val);
        }
    }

    return qUsers;
}
