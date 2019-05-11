const mongoose = require(`mongoose`);
const bcrypt = require(`bcrypt`);
const async = require(`async`);
const { check,body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const User = require(`../models/User`);

exports.POST_first_Setup_CountryandPostal = [ 
    //Validate
    body(`country`).trim().withMessage(`Please select a country`),
    body(`postalCode`).trim().withMessage(`There is an error with your postal code`),
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
                country: req.body.country,
                emailDisplay: `NOT SET`,
                phone: `NOT SET`,
                postalCode: req.body.postalCode,
                occupation: `NOT SET`,
                bio: `NOT SET`,
                portfolioUrl: `NOT SET`
            });

            //Confirm country and POstal Code 

            User.findByIdAndUpdate(req.user._id, user, {}, function(err, results) {
                if (err) {return next(err);}
                res.redirect(`/`);
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
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                country: `NOT SET`,
                emailDisplay: `NOT SET`,
                phone: `NOT SET`,
                postalCode: `NOT SET`,
                occupation: `NOT SET`,
                bio: `NOT SET`,
                portfolioUrl: `NOT SET`
            });

            //Check if user already exists
            User.findOne({"email": req.body.email}).exec(function(err, results) {
                if (err) {return next(err);}
        
                if (results) {
                    customValid.push({ msg: `That email already exists` });
                    console.log(`Duplicate Check`);
                    res.render(`register`, userLocal);
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