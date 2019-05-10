const mongoose = require(`mongoose`);
const login = require(`./config`);

module.exports = function() {
    let mongoDB = process.env.MONGODB_URI || login.devLogin;
    mongoose.connect(mongoDB, { useNewUrlParser: true });
    mongoose.connection.on(`error`, console.error.bind(console, `MongoDB connection error`));
}