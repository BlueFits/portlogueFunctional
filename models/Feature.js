const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FeatureSchema = new Schema({
    website: { type: Schema.Types.ObjectId, ref: "Website" },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feature", FeatureSchema);