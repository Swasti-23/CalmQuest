const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Register" // This references the "Register" model
    }
    // You can include other fields specific to your journal entries
});



// Create a model for the journal schema
const Journal = mongoose.model("Journal", journalSchema);

module.exports = Journal;
