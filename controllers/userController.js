const bcrypt = require(`bcrypt`);
const async = require(`async`);
const { check,body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const captureWebsite = require(`capture-website`);
const fs = require(`fs`);
const path = require(`path`);
const randomString = require(`randomstring`);
const mailer = require(`../misc/mailer`);

const User = require(`../models/User`);
const FriendStatus = require(`../models/friendStatus`);
const Token = require(`../models/Token`);

//Change web url
exports.POST_changeWebUrl = [
    //Validate Fields
    body(`url`).isURL().withMessage(`The link you have entered is invalid`),
    body(`websiteType`).isLength({ min: 1}).trim().withMessage(`Please choose a website type`),

    //Sanitize Fields
    sanitizeBody(`url`),
    sanitizeBody(`websiteType`).escape(),

    (req, res, next) => {
        //Initialize Validation
        let errors = validationResult(req);

        //Check for errors
        if (!errors.isEmpty()) {
            req.flash(`error`, errors.array());
            res.redirect(req.get("Referrer"));
        }
        
        else {

            //This will run in heroku
            async function snap() {
                await captureWebsite.file(req.body.url, `${req.user.email}-webthumbnail.png`, {
                    width: 1024,
                    height: 576,
                    launchOptions: {
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--single-process'
                          ],
                    }
                });
                console.log(`capture website ran`);
            }; 
            snap().then((cb)=> {
                console.log(`Saving User`);
                let newWebThumb = new User({
                    //Immutable values
                    _id: req.user._id,
                    status: req.user.status,
                    likedPortfolios: req.user.likedPortfolios,
                    viewedPortfolios: req.user.viewedPortfolios,
                    portfolioLikes: req.user.portfolioLikes,
                    friendList: req.user.friendList,
                    dateJoined: req.user.dateJoined,
                    //
                    portfolioImg: {data: fs.readFileSync(path.join(__dirname, `../${req.user.email}-webthumbnail.png`)), contentType:`image/png` },
                    portfolioType: req.body.websiteType.toLowerCase(),
                    portfolioUrl: req.body.url,
                });

                //Update props
                User.findByIdAndUpdate(req.user._id, newWebThumb, {}, function(err, results) {
                    if (err) {return next(err);}
                    //Delete image after Upload
                    fs.unlink(path.join(__dirname, `../${req.user.email}-webthumbnail.png`), (err) => {
                    if (err) throw `Error at userController fs.unlink`;
                    console.log(`File has been deleted`);
                    req.flash("success", [ {msg: "Successfully changed url."} ]);
                    res.redirect(req.get("Referrer"));
                    });
                });
            });            
        }
    }
]

//Update password
exports.POST_changePassword = [

    body("currentPass").isLength({ min: 1 }).withMessage("Please enter your old password"),
    body("newPass").isLength({ min: 6 }).withMessage("New password has to have 6 characters"),
    body("retypeNewPass"),
    
    sanitizeBody("currentPass").escape(),
    sanitizeBody("newPass").escape(),
    sanitizeBody("retypeNewPass").escape(),

    (req, res, next)=> {
        let errors = validationResult(req);

        let {currentPass, newPass, retypeNewPass} =  req.body;

        if (!errors.isEmpty()) {
            req.flash(`error`, errors.array());
            res.redirect(req.get("Referrer"));
            return
        }

        if (newPass !== retypeNewPass) {
            req.flash("error", [{ msg: "Passwords do not match" }]);
            res.redirect(req.get("Referrer"));
            return
        }

        else {
                    bcrypt.compare(currentPass, req.user.password, (err, isMatch)=> {
                        if (isMatch) {                            
                            let userUpdatePassword = new User({
                                //Immutable values
                                _id: req.user._id,
                                status: req.user.status,
                                likedPortfolios: req.user.likedPortfolios,
                                viewedPortfolios: req.user.viewedPortfolios,
                                portfolioLikes: req.user.portfolioLikes,
                                friendList: req.user.friendList,
                                dateJoined: req.user.dateJoined,
                                //
                                password: newPass
                            });

                            bcrypt.genSalt(10, function(err, salt) {
                                bcrypt.hash(newPass, salt, function(err, hash) {
                                    if (err) {return next(err);}
                                    userUpdatePassword.password = hash;
                                    //Save User with hashed Password
                                    User.findByIdAndUpdate(req.user._id, userUpdatePassword, {}, (err, updateRes)=> {
                                        if (err) {return next(err);}
                                        req.flash("success", [{ msg: "Successfully changed password." }]);
                                        res.redirect(req.get("Referrer"));
                                    });
                                });
                            });
                        }

                        else {
                            req.flash("error", [{ msg: "Invalid current password." }]);
                            res.redirect(req.get("Referrer"));
                        }
                    });
        }
    }

]

//Update account email
exports.POST_changeAccEmail = [

    body(`email`).isEmail().withMessage(`Invalid Email`),
    sanitizeBody("email").escape(),

    (req, res, next)=> {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash(`error`, errors.array());
            res.redirect(req.get("Referrer"));
        }

        else {

            User.findOne({"email": req.body.email}).exec((err, result)=> {

                if (err) {return next(err);}

                if (result) {
                    req.flash(`error`, [{ msg: "Email already taken." }]);
                    res.redirect(req.get("Referrer"));
                }

                else {

                    let newEmail = req.body.email.toLowerCase();
                    let oldEmail = req.user.email;

                    let userUpdate = new User({
                        //Unchangeable values
                        _id: req.user._id,
                        status: req.user.status,
                        likedPortfolios: req.user.likedPortfolios,
                        viewedPortfolios: req.user.viewedPortfolios,
                        portfolioLikes: req.user.portfolioLikes,
                        friendList: req.user.friendList,
                        dateJoined: req.user.dateJoined,
                        //
                        email: newEmail
                    });

                    require("./uploadController").email_change_handler(oldEmail, newEmail);

                    User.findByIdAndUpdate(req.user._id, userUpdate, {}, (err, updateRes)=> {
                        if (err) {return next(err);}
                        req.flash(`success`, [{ msg: "Succesfully changed email." }]);
                        res.redirect(req.get("Referrer"));
                    });
                }
            })
        }

    }

]

//Update about you 
exports.POST_aboutYou = [
    body(`country`).optional({ checkFalsy: true }),
    body(`postalCode`).optional({ checkFalsy: true }).isAlphanumeric().withMessage(`Invalid postal code.`),
    body(`occupation`).optional({ checkFalsy: true }),
    body(`bio`).optional({ checkFalsy: true }).isLength({ min: 3, max: 160 }).withMessage(`Max 160 characters.`),
    //Sanitize fields
    sanitizeBody(`country`).escape(),
    sanitizeBody(`postalCode`).escape(),
    sanitizeBody(`occupation`).escape(),
    sanitizeBody(`bio`).escape(),

    //
    (req, res, next) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash(`error`, errors.array());
            res.redirect(req.get(`Referrer`));
        }
        else {
            let userAboutYou = new User({
                //Unchangeable values
                _id: req.user._id,
                status: req.user.status,
                likedPortfolios: req.user.likedPortfolios,
                viewedPortfolios: req.user.viewedPortfolios,
                portfolioLikes: req.user.portfolioLikes,
                friendList: req.user.friendList,
                dateJoined: req.user.dateJoined,
                //
                country: req.body.country || req.user.country,
                postalCode: req.body.postalCode.toLowerCase() || req.user.postalCode,
                occupation: req.body.occupation ||req.user.occupation,
                bio: req.body.bio || req.user.bio
            });

            User.findByIdAndUpdate(req.user._id, userAboutYou, {} , (err, updateRes)=> {
                if (err) {return next(err);}
                req.flash(`success`, [{ msg: "Successfully changed settings." }]);
                res.redirect(req.get(`Referrer`));
            });
        }

    }
]

//Update user's personal info
exports.POST_personalInfo =  [
    //Validate all fields
    body('firstName').optional({ checkFalsy: true }).trim().withMessage('First name must be specified.').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('lastName').optional({ checkFalsy: true }).trim().withMessage('Last name must be specified.').isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),
    check(`emailDisplay`).optional({ checkFalsy: true }).isEmail().withMessage(`Email is invalid`),
    body(`phoneNumber`).optional({ checkFalsy: true }).trim(),
    //Santize fields
    sanitizeBody(`firstName`).escape(),
    sanitizeBody(`lastName`).escape(),
    sanitizeBody(`email`).escape(),
    sanitizeBody(`phoneNumber`).escape(),

    //Function 
    (req, res, next) => {

        //Initialize validation
        let errors = validationResult(req);

        //Check for errors
        if (!errors.isEmpty()) {
            req.flash(`error`, errors.array());
            res.redirect(req.get(`Referrer`));
        }

        else {
            let userUpdate = new User({
                //Unchangeable values
                _id: req.user._id,
                status: req.user.status,
                likedPortfolios: req.user.likedPortfolios,
                viewedPortfolios: req.user.viewedPortfolios,
                portfolioLikes: req.user.portfolioLikes,
                friendList: req.user.friendList,
                dateJoined: req.user.dateJoined,
                //
                firstName: req.body.firstName || req.user.firstName,
                lastName: req.body.lastName || req.user.lastName,
                fullname: req.body.firstName.toLowerCase()+req.body.lastName.toLowerCase() || req.user.fullname,
                emailDisplay: req.body.emailDisplay || req.user.emailDisplay,
                phone: req.body.phoneNumber || req.user.phone
            });
        
            User.findByIdAndUpdate(req.user._id, userUpdate, {}, (err, updateRes)=> {
                if (err) {return next(err);}
                req.flash(`success`, [{ msg: "Successfully changed settings." }]);
                res.redirect(req.get(`Referrer`));
                //Route to uploadAvatar to update avatar name photo
            });
        }
    }
]

//Redirect after update
exports.POST_changeAvatar = function(req, res, next) {
    req.flash("success", [{ msg: "Successfully changed profile picture." }]);
    res.redirect(req.get(`Referrer`));
}

//Liking Process
exports.POST_likeProfile = function(req, res, next) {
    //Push qUser to User's likedportfolios and increment qUser's portfolioLikes
    User.findOne({"username": req.body.qUsername}).exec((err, qUserRes)=> {

        if (err) {return next(err);}

        if (!qUserRes) {    
            res.send(`Error in the profile rendering :( it's lacks a parameter.`);
        }

        else {
            //Case where it is User to qUser
            //Run a check wether qUser is already in User's likedportfolios
            let checkLikes = false;

            User.findById(req.user._id).populate("likedPortfolios").exec((err, userRes)=> {
                if (err) {return next(err);}
                //For loop that iterates over likedPortfolios

                for (let val of userRes.likedPortfolios) {
                    if (val.username.toString() === qUserRes.username.toString()) {
                        checkLikes = true;
                    }
                }

                if (checkLikes === true) {
                    //Make the process for unliking

                    let userResNewList = [];
                    //Make a copy of user liked portfolios
                    for (let val of userRes.likedPortfolios) {
                        userResNewList.push(val);
                    }

                    //Gets rid of the liked portfolio
                    for (let i = 0; i < userResNewList.length; i++) {
                        if (userResNewList[i].username.toString() === qUserRes.username.toString()) {
                            userResNewList.splice(i, 1);
                        }
                    }


                    let userUpdate = new User({
                        _id: userRes._id,
                        status: userRes.status,
                        likedPortfolios: userResNewList,
                        viewedPortfolios: userRes.viewedPortfolios,
                        portfolioLikes: userRes.portfolioLikes,
                        friendList: userRes.friendList,
                        dateJoined: userRes.dateJoined
                    });

                    User.findByIdAndUpdate(userRes._id, userUpdate, {}, (err, updateRes)=> {
                        if (err) {return next(err);}
                        //Update user again to decrease like count
                        let qUserUpdate = new User({
                            _id: qUserRes._id,
                            status: qUserRes.status,
                            likedPortfolios: qUserRes.likedPortfolios,
                            viewedPortfolios: qUserRes.viewedPortfolios,
                            friendList: qUserRes.friendList,
                            portfolioLikes: qUserRes.portfolioLikes - 1,
                            dateJoined: qUserRes.dateJoined
                        });

                        User.findByIdAndUpdate(qUserRes._id, qUserUpdate, {},(err, updateRes)=> {
                            if (err) {return next(err);}
                            res.redirect(req.get(`Referrer`));
                        });

                    });

                }

                else {
                    //

                    let userUpdate = new User({
                        _id: userRes._id,
                        status: userRes.status,
                        likedPortfolios: userRes.likedPortfolios,
                        viewedPortfolios: userRes.viewedPortfolios,
                        friendList: userRes.friendList,
                        dateJoined: userRes.dateJoined,
                        portfolioLikes: userRes.portfolioLikes
                    });

                    userUpdate.likedPortfolios.push(qUserRes);

                    User.findByIdAndUpdate(userRes._id, userUpdate, {}, (err, updateRes)=> {
                        if (err) {return next(err);}
                        
                        let qUserUpdate = new User({
                            _id: qUserRes._id,
                            status: qUserRes.status,
                            likedPortfolios: qUserRes.likedPortfolios,
                            viewedPortfolios: qUserRes.viewedPortfolios,
                            friendList: qUserRes.friendList,
                            portfolioLikes: qUserRes.portfolioLikes + 1,
                            dateJoined: qUserRes.dateJoined
                        });

                        User.findByIdAndUpdate(qUserRes._id, qUserUpdate, {}, (err, updateRes)=> {
                            if (err) {return next(err);}
                            res.redirect(req.get(`Referrer`));
                        });

                    });

                }

            });
        }

    });

}

//Add friend process
exports.POST_confirmFriend = function(req, res, next) {
    
    User.findById(req.body.reqFrom).populate(`friendList`).exec((err, reqFrom)=> {

        if (err) {return next(err);}

        if (!reqFrom) {
            res.send(`NO USER`); //toFix
        }
        else {

            if (req.body.reqResponse === `accept`) {

                
                let friendStat = new FriendStatus({
                    _id: req.body.friendStatId,
                    status: 2
                });

                let user = new User({
                    _id: req.user._id,
                    status: req.user.status,
                    friendList: req.user.friendList,
                    dateJoined: req.user.dateJoined,
                    likedPortfolios: req.user.likedPortfolios,
                    viewedPortfolios: req.user.viewedPortfolios
                });
    
                let otherUser = new User({
                    _id: reqFrom._id,
                    status: reqFrom.status,
                    friendList: reqFrom.friendList,
                    dateJoined: reqFrom.dateJoined,
                    likedPortfolios: reqFrom.likedPortfolios,
                    viewedPortfolios:  reqFrom.viewedPortfolios
                });

                user.friendList.push(reqFrom);

                otherUser.friendList.push(req.user);

                FriendStatus.findByIdAndUpdate(req.body.friendStatId, friendStat, {}, (err, fStatAcc)=> {
                    if (err) {return next(err);}

                    User.findByIdAndUpdate(req.user._id, user, {}, (err, userRes)=> {
                        if (err) {return next(err);}
                    });

                    User.findByIdAndUpdate(reqFrom._id, otherUser, {}, (err, otherUserRes)=> {
                        if (err) {return next(err);}
                        res.redirect(`/`);
                    });

                });

            }
        
            else {

                
                let friendStat = new FriendStatus({
                    _id: req.body.friendStatId,
                    status: 3
                }); 

                FriendStatus.findByIdAndUpdate(req.body.friendStatId, friendStat, {}, (err, fStatDec)=> {
                    if (err) {return next(err);}
                    res.redirect(`/`);
                });

            }
        }
    });
}

exports.GET_addFriend = function(req, res, next) {
    User.findById(req.params.id).exec((err, qUser)=> {
        if (err) {return next(err);}

        FriendStatus.findOne({"requestFrom":req.user, "requestTo": qUser}).exec((err, result) => {
            if (err) {return next(err);}

            if (result) {
                res.send(`Already made a request to the user`);
            }

            else {
                let friendStat = new FriendStatus({
                    requestFrom: req.user,
                    requestTo: qUser,
                    status: 1
                });

                friendStat.save((err)=> {
                    if (err) {return next(err);}
                    res.redirect(req.get(`Referrer`));
                });
            }
        }); 
    });
}

/* Send Message */

exports.POST_send_message = function(req, res, next) {

    res.send(`request From ${req.body.requestFrom}`);

};

// First time Setup
exports.POST_first_Setup_Link = [
    
    //Validate Fields
    body(`link`).isURL().withMessage(`The link you have entered is invalid`),
    body(`websiteType`).isLength({ min: 1}).trim().withMessage(`Please choose a website type`),

    //Sanitize Fields
    sanitizeBody(`link`),
    sanitizeBody(`websiteType`).escape(),

    (req, res, next) => {
        //Initialize Validation
        let errors = validationResult(req);

        //Check for errors
        if (!errors.isEmpty()) {
            res.render(`firstSetup/setupLink`, { errors:errors.array(), User:req.user });
            return;
        }
        
        else {

            //This wont run in heroku
            async function snap() {
                await captureWebsite.file(req.body.link, `${req.user.email}-webthumbnail.png`, {
                    width: 1024,
                    height: 576,
                    launchOptions: {
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--single-process'
                          ],
                    }
                });
                console.log(`capture website ran`);
            }; 
            snap().then((cb)=> {
                console.log(`Saving User`);
                let newWebThumb = new User({
                    _id: req.user._id,
                    status: "active",
                    portfolioImg: {data: fs.readFileSync(path.join(__dirname, `../${req.user.email}-webthumbnail.png`)), contentType:`image/png` },
                    portfolioType: req.body.websiteType.toLowerCase(),
                    portfolioUrl: req.body.link,
                });

                //Update props
                User.findByIdAndUpdate(req.user._id, newWebThumb, {}, function(err, results) {
                    console.log(`User saved`);
                    if (err) {return next(err);}
                    //Delete image after Upload
                    fs.unlink(path.join(__dirname, `../${req.user.email}-webthumbnail.png`), (err) => {
                    if (err) throw `Error at userController fs.unlink`;
                    console.log(`File has been deleted`);
                    res.redirect(`/`);
                    });
                });
            });            
        }
    }
    
]



exports.POST_first_Setup_Avatar = function (req, res, next) {

    res.render(`firstSetup/setupAvatar`, { errors:[], User: req.user, avatar: `/publicAvatar/${req.user.email}`});
  
}

exports.POST_first_Setup_Profile = [
    //Validate all fields
    body(`emailDisplay`).isEmail().withMessage(`Email is invalid`),
    body(`phone`).optional({ checkFalsy: true }).trim(),
    body(`occupation`).isLength({ min:1 }).trim().withMessage(`Occupation is required`),
    body(`bio`).isLength({ min: 3, max: 160 }).optional({ checkFalsy: true }).withMessage(`Max characters of 160`),
    //Santize fields
    sanitizeBody(`emailDisplay`).escape(),
    sanitizeBody(`phone`).escape(),
    sanitizeBody(`occupation`).escape(),
    sanitizeBody(`bio`).escape(),

    (req, res, next) => {
        //Initialize validation
        let errors = validationResult(req);

        //If any errors occur run the if statement
        if (!errors.isEmpty()) {
            console.log(`there are errors`);
            res.render(`firstSetup/setupProfile`, { errors: errors.array(), User: req.user });
            return;
        }

        else {

            let occupationValue = req.body.occupation.toLowerCase();

            occupationValue = occupationValue.replace(occupationValue[0], occupationValue[0].toUpperCase());

            let user = new User({
                _id: req.user._id,
                emailDisplay: req.body.emailDisplay.toLowerCase(),
                phone: req.body.phone,
                occupation: occupationValue,
                bio: req.body.bio
            });

            User.findByIdAndUpdate(req.user._id, user, {}, function(err, results) {
                if (err) {return next(err);}
                res.redirect(`/users/first_time_setup_avatar`);
            });
        }
    }
]

exports.POST_first_Setup_CountryandPostal = [ 
    //Validate
    body(`country`).isLength({ min: 1 }).trim().withMessage(`Please select a country`),
    body(`postalCode`).isLength({ min: 1 }).trim().withMessage(`There is an error with your postal code`),
    //Sanitize 
    sanitizeBody(`country`).escape(),
    sanitizeBody(`postalCode`).escape(),

    (req, res, next) => {
        //Initialize validation
        let errors = validationResult(req);

        //If any errors occur run the if statement
        if (!errors.isEmpty()) {
            res.render(`firstSetup/getCountryandPostal`, {errors: errors.array(), User: req.user, selectCountry: require(`../arrayList/arrays`).countryList});
            return;
        }

        else {

            let user = new User({
                _id: req.user._id,
                country: req.body.country,
                postalCode: req.body.postalCode.toLowerCase(),
            });

            //Confirm country and POstal Code 

            User.findByIdAndUpdate(req.user._id, user, {}, function(err, results) {
                if (err) {return next(err);}
                res.redirect(`/users/first_time_setup_profile`);
            });
        }
    }
]

exports.create_User = [
    //Validate all fields
    body(`userName`).isLength({min: 1}).trim().withMessage(`Username is required`),
    body('firstName').isLength({ min: 1 }).trim().withMessage('First name must be specified.').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('lastName').isLength({ min: 1 }).trim().withMessage('Last name must be specified.').isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),
    check(`email`).isEmail().withMessage(`Email is invalid`),
    body(`password`).isLength({ min: 6 }).trim().withMessage(`Password needs a minimum of 6 Characters`),
    body(`confirmPassword`),
    //Santize fields
    sanitizeBody(`userName`).escape(),
    sanitizeBody(`firstName`).escape(),
    sanitizeBody(`lastName`).escape(),
    sanitizeBody(`email`).escape(),
    sanitizeBody(`password`).escape(),
    sanitizeBody(`confirmPassword`).escape(),

    (req, res, next) => {
        //Initialize validation
        let errors = validationResult(req);

        //Deconstruct variables
        let {userName, firstName, lastName, email, password, confirmPassword}  = req.body;

        //Custom Validation for password
        let customValid = [];

        // Object props for render
        let userLocal = {errors: errors.array(), errorsCustom: customValid, userName, firstName, lastName, email };
        
        //If any errors occur run the if statement
        if (errors.array().length > 2) {
            customValid.push({msg: `Errors in multiple fields`});
            res.render(`register`, {errors: [], errorsCustom: customValid, userName, firstName, lastName, email });
            return;
        }

        if (!( errors.isEmpty() && (password === confirmPassword) )) {
            customValid.push({ msg: `Passwords do not match` });
            res.render(`register`, userLocal);
            return;
        }
        //Data is Valid
        else {
            let user = new User({
                username: req.body.userName,
                firstName: req.body.firstName.toLowerCase(),
                lastName: req.body.lastName.toLowerCase(),
                fullName: req.body.firstName.toLowerCase()+req.body.lastName.toLowerCase(),
                email: req.body.email.toLowerCase(),
                password: req.body.password,
                country: `NOT SET`,
                emailDisplay: `NOT SET`,
                phone: `NOT SET`,
                postalCode: `NOT SET`,
                occupation: `NOT SET`,
                bio: `NOT SET`,
                portfolioType: `NOT SET`,
                portfolioUrl: `NOT SET`,
                portfolioImg: {data: fs.readFileSync(path.join(__dirname, `../portfolioThumb/no-img.png`)), contentType:`image/png` },
                portfolioLikes: 0,
                portfolioViews: 0,
                isVerified: false
            });

            //Check if user already exists

            async.parallel({
                check1: function(cb) {
                    User.findOne({"email": req.body.email}).exec(cb);
                },
                check2: function(cb) {
                    User.findOne({"username": req.body.userName}).exec(cb);
                }
            }, function(err, results) {

                if (err) {return next(err);} 

                if(results.check1 && results.check2) {
                    customValid.push({  msg: `That email already exists`});
                    customValid.push({ msg:`Username is taken` });
                    res.render(`register`, userLocal);
                    return;
                }

                if (results.check1) {
                    customValid.push({ msg:`That email already exists` });
                    res.render(`register`, userLocal);
                    return;
                }

                if (results.check2) {   
                    customValid.push({msg: `Username is taken`});
                    res.render(`register`, userLocal);
                    return;
                }

                else {
                    //Hash Password
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(user.password, salt, function(err, hash) {
                            if (err) {return next(err);}
                            user.password = hash;

                            //Save User with hashed Password
                            user.save(function(err, savedUser) {
                                if (err) {return next(err);}

                                //Generate secret token for confirmation   
                                const secretToken = randomString.generate();

                                let tokenCreate = new Token({
                                    _userId: savedUser,
                                    token: secretToken,
                                });

                                console.log(`${savedUser} --- this is the saved user`);

                                tokenCreate.save((err)=> {
                                    if (err) {return next(err);}

                                    //Send email confirmation

                                    const confirmationEmail = require(`../emailForwards/confirmation`)(secretToken);

                                    const mailOptions = {
                                        from: `info@portlogue.com`,
                                        to: req.body.email,
                                        subject: "Portlogue Verification Email.",
                                        html: confirmationEmail
                                    }

                                    console.log(`${req.body.email} -- got the email`);

                                    mailer.transporter.sendMail(mailOptions, (err, data)=> {
                                        if (err) {return next(err);}
                                        console.log(`Email has been sent to user`);
                                    });

                                    //Go back to login after saving
                                    req.flash(`success`, `An email has been sent to ${savedUser.email}. Please check it to proceed.`); //Change this for user confirmation only
                                    res.redirect(`/users/login`);
                                });
                            });
                        });
                    });
                }
            });
        }
    },
]