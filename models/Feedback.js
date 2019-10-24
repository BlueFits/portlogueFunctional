const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
    email: { type: String },
    feedback: { type: String },
    date: { type:Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);