const mongoose = require(`mongoose`);
const bcrypt = require(`bcrypt`);
const { check,body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const User = require(`../models/User`);

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
        //Deconstruct variables
        let {userName, firstName, lastName, email, password, confirmPassword}  = req.body;
        //Custom Validation for password
        let customValid = [];
        
        let errors = validationResult(req);

        if (!( errors.isEmpty() && (customValid.length > 0) )) {

            if (password !== confirmPassword) {
                customValid.push({ msg: `Passwords do not match` });
                res.render(`register`, {errors: errors.array(), errorsCustom: customValid, userName, firstName, lastName, email });
            }
            else {
                //Data is Valid
                console.log(password + " " + confirmPassword);
                let user = new User({
                    username: req.body.userName,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                    portfolioUrl: `Not Set`
                });

                //Hash Password
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(user.password, salt, function(err, hash) {
                        if (err) {return next(err);}
                        user.password = hash;
                        //Save User with hashed Password
                        user.save(function(err) {
                            if (err) {return next(err);}
            
                            res.send(`User saved`);
                        });

                    });
                });
            }
        }
    },
]