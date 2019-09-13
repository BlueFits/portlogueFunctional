const bcrypt = require(`bcrypt`);
const async = require(`async`);
const { check,body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Pageres = require(`pageres`);
const captureWebsite = require(`capture-website`);
const fs = require(`fs`);
const path = require(`path`);
const randomString = require(`randomstring`);
const mailer = require(`../misc/mailer`);

const User = require(`../models/User`);
const FriendStatus = require(`../models/friendStatus`);
const Token = require(`../models/Token`);

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
                    console.log(`${val} --- for loop values`);
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

                    console.log(userResNewList + "  This is the made up array list");
                    //Gets rid of the liked portfolio
                    for (let i = 0; i < userResNewList.length; i++) {
                        if (userResNewList[i].username.toString() === qUserRes.username.toString()) {
                            userResNewList.splice(i, 1);
                        }
                    }

                    console.log(userResNewList + "  After splicing");

                    let userUpdate = new User({
                        _id: userRes._id,
                        likedPortfolios: userResNewList,
                        viewedPortfolios: userRes.viewedPortfolios,
                        friendList: userRes.friendList,
                        dateJoined: userRes.dateJoined
                    });

                    User.findByIdAndUpdate(userRes._id, userUpdate, {}, (err, updateRes)=> {
                        if (err) {return next(err);}
                        console.log(`Removed user from liked portfolios`);
                        //Update user again to decrease like count
                        let qUserUpdate = new User({
                            _id: qUserRes._id,
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
                        likedPortfolios: userRes.likedPortfolios,
                        viewedPortfolios: userRes.viewedPortfolios,
                        friendList: userRes.friendList,
                        dateJoined: userRes.dateJoined
                    });

                    userUpdate.likedPortfolios.push(qUserRes);

                    User.findByIdAndUpdate(userRes._id, userUpdate, {}, (err, updateRes)=> {
                        if (err) {return next(err);}
                        console.log(`Added to portfolio likes`);
                        
                        let qUserUpdate = new User({
                            _id: qUserRes._id,
                            likedPortfolios: qUserRes.likedPortfolios,
                            viewedPortfolios: qUserRes.viewedPortfolios,
                            friendList: qUserRes.friendList,
                            portfolioLikes: qUserRes.portfolioLikes + 1,
                            dateJoined: qUserRes.dateJoined
                        });

                        console.log(`${qUserUpdate} --- qUser update log`);
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

                console.log(`User Accepted`);
                
                let friendStat = new FriendStatus({
                    _id: req.body.friendStatId,
                    status: 2
                });

                let user = new User({
                    _id: req.user._id,
                    friendList: req.user.friendList,
                    dateJoined: req.user.dateJoined,
                    likedPortfolios: req.user.likedPortfolios,
                    viewedPortfolios: req.user.viewedPortfolios
                });
    
                let otherUser = new User({
                    _id: reqFrom._id,
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
                        console.log(`otherUser Save`);
                        res.redirect(`/`);
                    });

                });

            }
        
            else {

                console.log(`User Denied`);
                
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
            //test

            /*async function snap() {
                console.log(`web thumb running`);
                await new Pageres({delay: 0})
                    .src(req.body.link, [`1024x576`], {crop: true, filename: `${req.user.email}-webthumbnail`})
                    .dest(path.join(__dirname, `../portfolioThumb`))
                    .run();
                    console.log(`It ran`);
            };*/

            snap().then((cb)=> {
                console.log(`Saving User`);
                let newWebThumb = new User({
                    _id: req.user._id,
                    portfolioImg: {data: fs.readFileSync(path.join(__dirname, `../${req.user.email}-webthumbnail.png`)), contentType:`image/png` }
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
            

            let user = new User({
                _id: req.user._id,
                portfolioType: req.body.websiteType.toLowerCase(),
                portfolioUrl: req.body.link,
            });

            User.findByIdAndUpdate(req.user._id, user, {}, (err, updateRes)=> {
                console.log(`User info A saved`);
                if (err) {return next(err);}
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
    //Santize fields
    sanitizeBody(`userName`).escape(),
    sanitizeBody(`firstName`).escape(),
    sanitizeBody(`lastName`).escape(),
    sanitizeBody(`email`).escape(),
    sanitizeBody(`password`).escape(),

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
                                        from: `Excited User <mailgun@samples.mailgun.org>`,
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