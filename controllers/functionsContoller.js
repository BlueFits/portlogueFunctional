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

exports.renderHomeFilter = function(next, req, res, profileRes, User, friendVal, userCheck, likeFunction) {

    likeFunction.status = "";

    if (userCheck === true) {
        console.log(`Profile already saved`);
        res.render(`profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: profileRes, User: req.user, friendVal, likeFunction});
    }

    else {
        let user = new User({
            _id:req.user._id,
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
                portfolioViews: profileRes.portfolioViews + 1,
                dateJoined: profileRes.dateJoined
            });

            User.findByIdAndUpdate(profileRes._id, pRes, {}, (err, updateRes)=> {
                if (err) {return next(err);}
                res.render(`profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: profileRes, User: req.user, friendVal, likeFunction});
            });
            //
            //res.render(`profilePage/profilePageIframe`, {layout: `profilePage/profilePageLayout` , qUser: profileRes, User: req.user, friendVal});
        });
    }
}