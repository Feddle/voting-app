const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const pollSchema = new Schema({
    title: String,
    options: {},
    link: {type: String, unique: true},
    private: {type: Boolean, default: false}
});

const Poll = mongoose.model("votingAppPolls", pollSchema);

module.exports = Poll;