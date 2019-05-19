const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    mA: {type: Schema.Types.ObjectId, ref: `User`},
    mB: {type: Schema.Types.ObjectId, red: `User`},
    message: [{type: String, required: false}],
});

module.exports = mongoose.model(`Message`, MessageSchema);