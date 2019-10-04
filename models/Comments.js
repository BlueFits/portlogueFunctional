const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const CommentsSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

/* Virtuals */
CommentsSchema.virtual("dateRelative").get(()=> {
    return moment(this.date).fromNow(); //For now
});

module.exports = mongoose.model("Comments", CommentsSchema);