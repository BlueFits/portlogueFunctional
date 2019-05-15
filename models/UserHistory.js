const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const UserHistorySchema = new Schema({
    historyOne: {type: Schema.Types.ObjectId, ref: `User`, required: false},
    historyTwo: {type: Schema.Types.ObjectId, ref: `User`, required: false},
    historyThree: {type: Schema.Types.ObjectId, ref: `User`, required: false},
    historyFour: {type: Schema.Types.ObjectId, ref: `User`, required: false}
});

module.exports = mongoose.model(`UserHistory`, UserHistorySchema);