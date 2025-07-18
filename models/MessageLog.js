const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    groupName: { type: String, required: true },
    gfgLink: { type: String },
    leetcodeLink: { type: String }
});

module.exports = mongoose.model("MessageLog", messageLogSchema);
