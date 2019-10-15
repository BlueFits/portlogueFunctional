const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    url: { type:String, required: true, lowercase: true },
    siteName: { type: String, required: true, lowercase: true },
    type: { type: String, required: true, lowercase: true },
    colors: [{ type: String, required: false, lowercase: true }],
    category:{ type: String, required: true, lowercase: true },
    description: { type: String, required: false, max: 500 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
    likes: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0},
    webThumb: {data: Buffer, contentType: String},
    date: { type: Date, default: Date.now },
});

/* Virtuals for the Schema */
WebsiteSchema.virtual("dateDisplay").get(function() {
    return moment(this.date).format("MMMM Do, YYYY");
});

//Category Display return random category
WebsiteSchema.virtual("categoryDisplay").get(function() {
    return this.category.replace(this.category[0], this.category[0].toUpperCase());
});


module.exports = mongoose.model("Website", WebsiteSchema);