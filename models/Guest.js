const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const GuestSchema = new Schema({
    ip: { type: String, default: "n/a" },
    country: { type: String, default: "n/a" },
    region: { type: String, default: "n/a" },
    city: { type: String, default: "n/a" },
    timezone: { type: String, default: "n/a" },
    referredFrom: { type: String, default: "n/a" },
    viewedSite: [{ type: Schema.Types.ObjectId, ref: "Website" }],
    date: { type: Date, required: true, default: Date.now, expires: 43200 }
});


module.exports = mongoose.model(`Guest`, GuestSchema);