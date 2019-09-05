const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const LikeStatusSchema = new Schema({

    from: {type: Schema.Types.ObjectId, ref: "User"},
    to: {type: Schema.Types.ObjectId, ref: "User"},
    status: {type: Number, default: 1}

});

module.exports = mongoose.model(`LikeStatus`, LikeStatusSchema);