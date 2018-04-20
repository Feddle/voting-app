const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    twitterId: String,
    polls: [String]
});

const User = mongoose.model("votingAppUsers", userSchema);


module.exports = User;
