const bcrypt = require(`bcrypt`);
const async = require(`async`);
const { check,body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const captureWebsite = require(`capture-website`);
const fs = require(`fs`);
const path = require(`path`);
const randomString = require(`randomstring`);
const mailer = require(`../misc/mailer`);

const Website = require("../models/Website");
const Comment = require("../models/Comments")
const User = require(`../models/User`);
const FriendStatus = require(`../models/friendStatus`);
const Token = require(`../models/Token`);


/* like, favourite, save in history POST processes */

//Liking websites
exports.POST_likeSite = function(req, res, next) {
    const { websiteId } = req.body;
    User.findById(req.user._id).populate("likedSites").exec((err, user)=> {
        if (err) {return next(err);}

        Website.findById(websiteId).exec((err, website)=> {
            if (err) {return next(err);}

            //Check if website is already liked
            let liked = false;

            //Check if it already liked
            for (let val of user.likedSites) {
                if (val._id.toString() === websiteId.toString()) {
                    liked = true;
                }
            }
            //Unlike sites
            if (liked) { 
                
                //Make a copy of the array
                let likedSitesCopy = [...user.likedSites];

                //Loop over the copy and get rid of the current website
                for (let i = 0; i < likedSitesCopy.length; i++) {
                    if (likedSitesCopy[i]._id.toString() === website._id.toString()) {
                        console.log("Removed " + likedSitesCopy[i].siteName);
                        likedSitesCopy.splice(i, 1);
                    }
                }

                //Save the new likedSites array and decrement website likes
                let unlikeUser = {
                    $set: {
                        likedSites: likedSitesCopy
                    }
                };

                let unlikeWebsite = {
                    $set: {
                        likes: website.likes - 1
                    }
                };

                User.findByIdAndUpdate(user._id, unlikeUser, {}, (err, userUpdate)=> {
                    if (err) {return next(err);}
                    Website.findByIdAndUpdate(website._id, unlikeWebsite, {}, (err, websiteUpdate)=> {
                        if (err) {return next(err);}
                        res.send({status: "unliked", likes: unlikeWebsite.$set.likes});
                    });
                });

            }
            //like sites
            if (!liked) {

                let newUser = {
                    $set: {
                        likedSites: user.likedSites
                    }
                }
                newUser.$set.likedSites.push(website._id);

                let newWeb = {
                    $set: {
                        likes: website.likes + 1
                    }
                }

                User.findByIdAndUpdate(user._id, newUser, {}, (err, userUpdate)=> {
                    if (err) {return next(err);}
                    Website.findByIdAndUpdate(website._id, newWeb, {}, (err, webUpdate)=> {
                        if (err) {return next(err);}
                        res.send({status: "liked", likes: newWeb.$set.likes});//toFix
                    });
                });
            }
        });
    });
}

//viewed sites/history saving
exports.POST_viewedSites = function(req, res, next) {
    
    //Deconstruct
    const { websiteId } = req.body;

    User.findById(req.user._id).populate("viewedSites").exec((err, user)=> {
        if (err) {return next(err);}

        Website.findById(websiteId).exec((err, website)=> {
            if (err) {return next(err);}

            //Check if website is in viewedSites if not then add it, if it is then leave it
            let viewed = false;

            //(Iterate over user viewed site)
            for (let val of user.viewedSites) {
                if (val._id.toString() === websiteId.toString()) {
                    viewed = true;
                }
            }
            
            //Add to user viewedSites and Increment website views
            if (!viewed) {
                
                let newUser = {
                    $set: {
                        viewedSites: user.viewedSites
                    }
                };
                newUser.$set.viewedSites.push(websiteId);
                let newWeb = {
                    $set: {
                        views: website.views + 1
                    }
                }
                
                //Update user and update website
                User.findByIdAndUpdate(user._id, newUser, {}, (err, userUpdate)=> {
                    if (err) {return next(err);}
                    Website.findByIdAndUpdate(website._id, newWeb, {}, (err, webUpdate)=> {
                        if (err) {return next(err);}
                        res.send("Site has been updated");//toFix
                    });
                });
            }

            else {
                res.send("already viewed site");//toFix
            }

        });
    });
}

/* Comment System */
exports.POST_comment = [
    //Validate
    body("value").trim(),
    //Sanitize
    sanitizeBody("value").escape(),
    //Function
    function(req, res, next) {

        let  { value, websiteId } = req.body;

        let comment = new Comment({
            user: req.user._id,
            comment: value
        });

        comment.save((err, commentUpdate)=> {
            console.log("Comment saved "+commentUpdate);
            Website.findById(websiteId).exec((err, website)=> {
                if (err) {return next(err);}
                let comment = {
                    $set: {
                        comments: website.comments
                    }
                };

                comment.$set.comments.push(commentUpdate._id);

                Website.findByIdAndUpdate(websiteId, comment, {}, (err, webUpdate)=> {
                    res.send(value);
                });
            });
        });

    }
]

/* Settings System */

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

/* Friends System */

exports.POST_confirmFriend = function(req, res, next) {
    
    User.findById(req.body.reqFrom).populate(`friendList`).exec((err, reqFrom)=> {

        if (err) {return next(err);}

        if (!reqFrom) {
            res.send(`NO USER`); //toFix
        }
        else {

            if (req.body.reqResponse === `accept`) {

                
                let friendStat = {
                    $set: {
                        _id: req.body.friendStatId,
                        status: 2
                    }
                };

                let user = {
                    $set: {
                        friendList: req.user.friendList,
                    }
                };
    
                let otherUser = {
                    $set: {
                        friendList: reqFrom.friendList,
                    }
                };

                user.$set.friendList.push(reqFrom);

                otherUser.$set.friendList.push(req.user);

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

                
                let friendStat = {
                    $set: {
                        _id: req.body.friendStatId,
                        status: 3
                    }
                }; 

                FriendStatus.findByIdAndUpdate(req.body.friendStatId, friendStat, {}, (err, fStatDec)=> {
                    if (err) {return next(err);}
                    res.redirect(`/`);
                });

            }
        }
    });
}

exports.POST_addFriend = function(req, res, next) {

    console.log("User findbyid running");
    //Find profile's user and make a new friendStatus model
    User.findById(req.body.id).exec((err, qUser)=> {
        if (err) {return next(err);}

        console.log("find by id ran");

        FriendStatus.findOne({ requestFrom: req.user, requestTo: qUser }).exec((err, request)=> {
            if (err) {return next(err);}

            if (request) {
                res.send("Already made a request to the user");
            }

            else {
                let friendStat = new FriendStatus({
                    requestFrom: req.user._id,
                    requestTo: qUser._id,
                    status: 1
                });

                friendStat.save((err, saveResult)=> {
                    if (err) {return next(err);}
                    req.flash("success", [{ msg: "Friend request sent" }]);
                    res.redirect(req.get("Referrer"));
                });

            }

        });

    });

}

/* Message System */

exports.POST_send_message = function(req, res, next) {

    res.send(`request From ${req.body.requestFrom}`);

};

/* First Time Setup System */

exports.POST_first_Setup_Link = [
    
    //Validate Fields
    body(`link`).isURL().withMessage(`The link you have entered is invalid`),
    body(`websiteType`).isLength({ min: 1}).trim().withMessage(`Please choose a website type`),
    body("siteName").isLength({ min: 1 }).trim().withMessage("Website name is required"),
    body("category").isLength({ min: 1 }).trim().withMessage("Need at least one category"),
    body("color").isLength({ min: 1 }).trim().withMessage("Need at least one color"),
    body("description").isLength({ max: 500 }).optional({ checkFalsy: true }).withMessage("Max of 500 chars"),

    //Sanitize Fields
    sanitizeBody(`link`),
    sanitizeBody(`websiteType`).escape(),
    sanitizeBody("siteName").escape(),
    sanitizeBody("category").escape(),
    sanitizeBody("color").escape(),
    sanitizeBody("description").escape(),

    (req, res, next) => {
        //Initialize Validation
        let errors = validationResult(req);

        //Deconstruct
        let { link, websiteType, siteName, category, color, description } = req.body;

        //Make colors and category an array
        let colorArray = color.toLowerCase().split(" ");
        
        //Check for errors
        if (!errors.isEmpty()) {
            res.render(`firstSetup/setupLink`, { errors:errors.array(), User:req.user });
            return;
        }
        
        else {

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
                let newWebThumb = new Website({
                    owner: req.user._id,
                    url: link,
                    siteName,
                    type: websiteType,
                    colors: colorArray,
                    category,
                    description,
                    webThumb: { data: fs.readFileSync(path.join(__dirname, `../${req.user.email}-webthumbnail.png`)), contentType:`image/png` },
                });

                //Update props
                newWebThumb.save(function(err, results) {
                    console.log(`Website saved`);
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
    body(`bio`).isLength({ min: 3, max: 160 }).optional({ checkFalsy: true }).withMessage(`Max characters of 160`),
    body("occupation").isLength({ min: 1 }).withMessage("Occupation is required"),
    //Santize fields
    sanitizeBody(`emailDisplay`).escape(),
    sanitizeBody(`phone`).escape(),
    sanitizeBody(`occupation`).escape(),
    sanitizeBody(`bio`).escape(),

    (req, res, next) => {
        //Initialize validation
        let errors = validationResult(req);

        //Deconstruct
        let {emailDisplay, phone, occupation, bio} = req.body;

        //If any errors occur run the if statement
        if (!errors.isEmpty()) {
            console.log(`there are errors`);
            res.render(`firstSetup/setupProfile`, { errors: errors.array(), User: req.user });
            return;
        }

        else {

            let user = {
                $set: {
                    emailDisplay,
                    phone,
                    occupation: occupation.toString(),
                    bio
                }
            };

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

        //Deconstruct req.body
        let { country, postalCode } = req.body;

        //If any errors occur run the if statement
        if (!errors.isEmpty()) {
            res.render(`firstSetup/getCountryandPostal`, {errors: errors.array(), User: req.user, selectCountry: require(`../arrayList/arrays`).countryList});
            return;
        }

        else {

            let user = {
                $set : {
                    status: "active",
                    country,
                    postalCode: postalCode.toString()
                }
            };

            //Confirm country and Postal Code 

            User.findByIdAndUpdate(req.user._id, user, {}, function(err, updateRes) {
                if (err) {return next(err);}
                res.redirect(`/users/first_time_setup_profile`);
            });
        }
    }
]

/* User Creation System*/

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
                isVerified: false,
                username: userName,
                firstName,
                lastName,
                email: email,
                password: password,
            });

            //Check if user already exists

            async.parallel({
                check1: function(cb) {
                    User.findOne({ "email": email }).exec(cb);
                },
                check2: function(cb) {
                    User.findOne({ "username": userName }).exec(cb);
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
                                        to: email,
                                        subject: "Portlogue Verification Email.",
                                        html: confirmationEmail
                                    }

                                    console.log(`${req.body.email} -- got the email`);

                                    mailer.transporter.sendMail(mailOptions, (err, data)=> {
                                        if (err) {return next(err);}
                                        console.log(`Email has been sent to user`);
                                    });

                                    //Go back to login after saving
                                    req.flash(`success`, `A verification email has been sent to ${savedUser.email}.`); //Change this for user confirmation only
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