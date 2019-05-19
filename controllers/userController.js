const mongoose = require(`mongoose`);
const bcrypt = require(`bcrypt`);
const async = require(`async`);
const { check,body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Pageres = require(`pageres`);
const fs = require(`fs`);
const path = require(`path`);

const User = require(`../models/User`);
const FriendStatus = require(`../models/friendStatus`);

//Add friend process

exports.POST_addFriend = function(req, res, next) {

    User.findById(req.body.userToAdd).exec((err, result)=> {

        if (err) {return next(err);}

            let friendStatus = new FriendStatus({
                requestFrom: req.user,
                requestTo: result,
                status: 1
            });

            FriendStatus.find({"requestFrom": req.user, "requestTo": result}).exec((err, results)=> {

                if (err) {return next(err)};

                if (results.length > 0) {

                    res.send(`Already Made a request to the User`);

                }

                else {

                    friendStatus.save((err)=> {
                        if (err) {return next(err)};
                        res.redirect(req.get(`Referrer`));
                    });

                }

            });

    });

}

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

                (async function() {
                    console.log(`web thumb running`);
                    await new Pageres({delay: 0})
                        .src(req.body.link, [`1920x1080`], {crop: true, filename: `${req.user.email}-webthumbnail`})
                        .dest(path.join(__dirname, `../portfolioThumb`))
                        .run();
                        console.log(`It ran`);
                        console.log(`Saving User`);
                        let user = new User({
                            _id: req.user._id,
                            username: req.user.userName,
                            firstName: req.user.firstName,
                            lastName: req.user.lastName,
                            email: req.user.email,
                            password: req.user.password,
                            country: req.user.country,
                            emailDisplay: req.user.emailDisplay,
                            phone: req.user.phone || `NOT SET`,
                            postalCode: req.user.postalCode,
                            occupation: req.user.occupation,
                            bio: req.user.bio || `NOT SET`,
                            portfolioType: req.body.websiteType.toLowerCase(),
                            portfolioUrl: req.body.link,
                            portfolioImg: {data: fs.readFileSync(path.join(__dirname, `../portfolioThumb/${req.user.email}-webthumbnail.png`)), contentType:`image/png` }
                        });

                        //Delete image after Upload
                        fs.unlink(path.join(__dirname, `../portfolioThumb/${req.user.email}-webthumbnail.png`), (err) => {
                            if (err) throw `Error at userController fs.unlink`;
                            console.log(`File has been deleted`);
                        });

                        //Update props
                        User.findByIdAndUpdate(req.user._id, user, {}, function(err, results) {
                            if (err) {return next(err);}
                            res.redirect(`/`);
                        });
                })();
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
            let user = new User({
                _id: req.user._id,
                username: req.user.userName,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                password: req.user.password,
                country: req.user.country,
                emailDisplay: req.body.emailDisplay.toLowerCase(),
                phone: req.body.phone || `NOT SET`,
                postalCode: req.user.postalCode,
                occupation: req.body.occupation.toLowerCase(),
                bio: req.body.bio || `NOT SET`,
                portfolioType: `NOT SET`,
                portfolioUrl: `NOT SET`,
                portfolioImg: {data: fs.readFileSync(path.join(__dirname, `../portfolioThumb/no-img.png`)), contentType:`image/png` }
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
                username: req.user.userName,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                password: req.user.password,
                country: req.body.country.toLowerCase(),
                emailDisplay: `NOT SET`,
                phone: `NOT SET`,
                postalCode: req.body.postalCode.toLowerCase(),
                occupation: `NOT SET`,
                bio: `NOT SET`,
                portfolioType: `NOT SET`,
                portfolioUrl: `NOT SET`,
                portfolioImg: {data: fs.readFileSync(path.join(__dirname, `../portfolioThumb/no-img.png`)), contentType:`image/png` }
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
    body('lastName').isLength({ min: 1 }).trim().withMessage('Last name must be specified.').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
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
                portfolioViews: 0
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
                            user.save(function(err) {
                                if (err) {return next(err);}
                                //Go back to login after saving
                                req.flash(`success`, `Successfully registered`);
                                res.redirect(`/users/login`);
                            });
                        });
                    });
                }



            });
        }
    },
]