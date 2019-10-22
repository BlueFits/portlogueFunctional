const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const FeaturedSchema = new Schema({
    website: { type:Schema.Types.ObjectId, ref: "Website" },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Featured", FeaturedSchema);