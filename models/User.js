const mongoose = require(`mongoose`);
const moment = require("moment");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    status: {  type: String, required: true, default: "inactive"  },
    isVerified: {  type: Boolean, default: true  },
    username: {  type: String, required: true, lowercase: true },
    firstName: { type: String, required: true, lowercase: true },
    lastName: { type: String, required: true, lowercase: true },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, min: 6, required: true },
    country: { type: String, default: "n/a", required: true, lowercase: true },
    emailDisplay: { type: String, required: false, default: "n/a" },
    phone: { type: String, required: false, max: 10, default: "n/a" },
    postalCode: { type: String, required: false, max: 32, default: "n/a", lowercase: true }, //This is uppercase
    occupation: [{ type: String, required: true, lowercase: true }],
    bio: { type: String, min: 3, max: 160, required: false },
    //websites: [{ type: Schema.Types.ObjectId, ref: "Website" }], Eachwebsite has an owner
    likedSites: [{ type:Schema.Types.ObjectId, ref: `Website` }], //Use .populate on objectId
    viewedSites: [{ type: Schema.Types.ObjectId, ref: "Website" }],
    favorites: [{ type:Schema.Types.ObjectId, ref: "Website" }],
    friendList: [{ type: Schema.Types.ObjectId, ref: `User` }],
    dateJoined: { type: Date, default: Date.now }
});


//Validation
function arrayLimit(val) {
    return val.length <= 5;
}

/* Virtual for user Schema (DO NOT USER ARROW FUNCTIONS IN VIRTUALS)*/

//Occupation Display
UserSchema.virtual("occupationShort").get(function() {

    let arrayFilter = [];

    for (let i = 0; i < 3; i++) {
        if (this.occupation[i]) {
            arrayFilter.push(this.occupation[i]);
        }
    }

    let stringDisplay = arrayFilter.join(", ")

    stringDisplay = stringDisplay.replace(stringDisplay[0], stringDisplay[0].toUpperCase());

    let toDisplay = stringDisplay.split(" ").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");

    return toDisplay.replace(/-/g, " ") + "...";
});

UserSchema.virtual("occupationFull").get(function() {
    let stringDisplay = this.occupation.join(", ")

    stringDisplay = stringDisplay.replace(stringDisplay[0], stringDisplay[0].toUpperCase());

    return stringDisplay.split(" ").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
});

//For full name
UserSchema.virtual(`fullName`).get(function() {
    let first = this.firstName.replace(this.firstName[0], this.firstName[0].toUpperCase());
    let last = this.lastName.replace(this.lastName[0], this.lastName[0].toUpperCase());
    return first + " " + last;
});

//Consider this
UserSchema.virtual(`url`).get(function() {
    return `/user/${this._id}` //For Now
});

//Display Time
UserSchema.virtual("dateDisplay").get(function() {
    return moment(this.dateJoined).format("MMMM Do, YYYY");
});


//Country Display
UserSchema.virtual("countryDisplay").get(function() {
    return this.country.replace(this.country[0], this.country[0].toUpperCase());
});

//Postal Code Display
UserSchema.virtual("postalDisplay").get(function() {
    return this.postalCode.toUpperCase();
});

module.exports = mongoose.model(`User`, UserSchema);