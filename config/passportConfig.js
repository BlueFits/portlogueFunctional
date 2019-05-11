const LocalStrat = require(`passport-local`).Strategy;
const mongoose = require(`mongoose`);
const bcrypt = require(`bcrypt`);

const User = require(`../models/User`);

module.exports = function(passport) {

    passport.use(new LocalStrat({ usernameField: `email` }, function(email, password, done) {

        User.findOne({ "email": email }).exec(function(err, results) {

            if (err) throw err;

            if (!results) {

                return done(null, false, {message:`Account does not exist`});

            }

            bcrypt.compare(password, results.password, function(err, isMatch) {

                if (err) {return done(err);}

                if (isMatch) {

                    return done(null, results);

                }

                else {

                    return done(null, false, {message: "Incorrect Password"});

                }

            });

        });

    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });

      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });

};