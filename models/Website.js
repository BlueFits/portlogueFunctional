const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    country: { type: String, lowercase: true },
    url: { type:String, required: true, lowercase: true },
    siteName: { type: String, required: true, lowercase: true },
    styles: [{ type: String, required: true, lowercase: true }],
    colors: [{ type: String, required: false, lowercase: true }],
    technologies:[{ type: String, lowercase: true }],
    description: { type: String, required: false, max: 500 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
    likes: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0},
    webThumb: { data: Buffer, contentType: String },
    date: { type: Date, default: Date.now },
});

/* Virtuals for the Schema */
WebsiteSchema.virtual("dateDisplay").get(function() {
    return moment(this.date).format("MMMM Do, YYYY");
});

//Category Display

WebsiteSchema.virtual("stylesDisplay").get(function() {

    let toDisplay = [];
    let stringDisplay;
    for (let val of this.styles) {
        toDisplay.push(val.replace(val[0], val[0].toUpperCase()));
    }
    stringDisplay = toDisplay.join(", ");
    return stringDisplay;

});

WebsiteSchema.virtual("technologiesDisplay").get(function() {

    let toDisplay = [];
    let stringDisplay;
    for (let val of this.technologies) {
        toDisplay.push(val.replace(val[0], val[0].toUpperCase()));
    }
    stringDisplay = toDisplay.join(", ");
    return stringDisplay;

});

//Site name
WebsiteSchema.virtual("sitenameDisplay").get(function() {
    return this.siteName.toLowerCase().split(" ").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
});


module.exports = mongoose.model("Website", WebsiteSchema);