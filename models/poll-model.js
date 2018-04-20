const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const pollSchema = new Schema({
    title: String,
    options: {},
    link: {type: String, unique: true}
});

const Poll = mongoose.model("votingAppPolls", pollSchema);

module.exports = Poll;