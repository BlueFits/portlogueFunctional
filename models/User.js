const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, min: 6, required: true},
    country: {type: String, required: true},
    emailDisplay: {type: String, required: true},
    phone: {type: String, required: false},
    postalCode: {type: String, requried: true},
    occupation: {type: String, required: false},
    bio: {type: String, max: 160, required: false},
    portfolioUrl: {type:String, required: true},
    dateJoined: {type: Date, default: Date.now}
});

/* Virtual for user Schema */

UserSchema.virtual(`fullName`).get(function() {
    return this.firstName + " " + this.lastName;
});

UserSchema.virtual(`url`).get(function() {
    return `/user/${this._id}` //For Now
});;

module.exports = mongoose.model(`User`, UserSchema);