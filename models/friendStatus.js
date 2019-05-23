const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const FriendStatusSchema = new Schema({

    requestFrom: {type: Schema.Types.ObjectId, ref: `User`},
    requestTo: {type: Schema.Types.ObjectId, ref: `User`},
    status: {type: Number, default: 0} //0. n/a, 1. Waiting, 2. Accepted, 3. Rejected 

});

module.exports = mongoose.model(`FriendStatus`, FriendStatusSchema);