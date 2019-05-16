const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const FriendRequestSchema = new Schema({
    requester: {type: Number, required: true},
    recipient: {type: Number, requried: true},
    status: {type: Number, min: 1, max: 3, required: true}
});

module.exports = mongoose.model(`FriendRequest`, FriendRequestSchema);