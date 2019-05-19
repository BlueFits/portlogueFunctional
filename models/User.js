const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    fullName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, min: 6, required: true},
    country: {type: String, required: true},
    emailDisplay: {type: String, required: true},
    phone: {type: String, required: false, max: 10},
    postalCode: {type: String, requried: true, max: 32},
    occupation: {type: String, required: false},
    bio: {type: String, min: 3, max: 160, required: false},
    portfolioUrl: {type:String, required: true},
    portfolioType: {type: String, required: true},
    portfolioImg: {data: Buffer, contentType: String},
    portfolioLikes: {type: Number, requried: true},
    portfolioViews: {type: Number, requried: true},
    likedPortfolios: [{type:Schema.Types.ObjectId, ref: `User`, required: false}], //Use .populate on objectId
    viewedPortfolios: [{type:Schema.Types.Mixed, ref: `User`, required: false}],
    friendList: [{type: Schema.Types.ObjectId, ref: `User`}], 
    messagedUsers: [{type: Schema.Types.ObjectId}],
    dateJoined: {type: Date, default: Date.now}
});

/* Virtual for user Schema */

UserSchema.virtual(`fullNameDisplay`).get(function() {
    let first = this.firstName.replace(this.firstName[0], this.firstName[0].toUpperCase());

    let last = this.lastName.replace(this.lastName[0], this.lastName[0].toUpperCase());

    return first + " " + last;
});

UserSchema.virtual(`url`).get(function() {
    return `/user/${this._id}` //For Now
});;

module.exports = mongoose.model(`User`, UserSchema);