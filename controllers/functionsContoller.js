exports.userHistory = function(reqUser) {

    let displayControl = [];
    let history = [];

                for (let val of reqUser.viewedPortfolios) {
                    displayControl.push(val);
                }

                displayControl = displayControl.reverse();

                for (let i = 0; i < 8; i++) {
                    history.push(displayControl[i]);
                }

                return history.filter(Boolean);

}

exports.renderHomeFilter = function(req, res, profileRes, User, friendVal, userCheck) {
    if (userCheck === true) {
        console.log(`Profile already saved`);
        res.render(`profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: profileRes, User: req.user, friendVal});
    }

    else {
        let user = new User({
            _id:req.user._id,
            viewedPortfolios: req.user.viewedPortfolios
        });

        user.viewedPortfolios.push(profileRes._id);

        User.findByIdAndUpdate(req.user._id, user, {}, (err, result)=> {
            if (err) {return next(err);}

            res.render(`profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: profileRes, User: req.user, friendVal});
        });
    }
}