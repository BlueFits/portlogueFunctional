const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    country: { type: String, lowercase: true },
    url: { type:String, required: true, lowercase: true },
    siteName: { type: String, required: true, lowercase: true },
    type: { type: String, required: true, lowercase: true },
    colors: [{ type: String, required: false, lowercase: true }],
    category:[{ type: String, lowercase: true }],
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
WebsiteSchema.virtual("categoryDisplay").get(function() {

    let toDisplay = [];
    let stringDisplay;
    for (let val of this.category) {
        toDisplay.push(val.replace(val[0], val[0].toUpperCase()));
    }
    stringDisplay = toDisplay.join(", ");
    return stringDisplay;

});

//Site name
WebsiteSchema.virtual("sitenameDisplay").get(function() {
    return this.siteName.toLowerCase().split(" ").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
});

//Website type
WebsiteSchema.virtual("typeDisplay").get(function() {

    let toDisplay = null;

    switch (this.type) {
        case "personal":
            toDisplay = "Personal Website";
            break;
        case "ecommerce":
            toDisplay = "E-commerce";
            break;
        case "photosharing":
            toDisplay = "Photo Sharing Website";
            break;
        case "writers":
            toDisplay = "Writers/Authors Website";
            break;
        case "community":
            toDisplay = "Community Building Website";
            break;
        case "mobile":
            toDisplay ="Mobile Device Website";
            break;
        case "blogs":
            toDisplay ="Blog";
            break
        case "informational":
            toDisplay ="Informational Website";
            break;
        case "online-business":
            toDisplay ="Online Business Brochure/Catalog";
            break;    
    }

    return toDisplay;
})


module.exports = mongoose.model("Website", WebsiteSchema);