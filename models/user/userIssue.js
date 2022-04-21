const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Document = new Schema({
    document: {
        type: String,
        // required: true
      },
})


const UserIssues = new Schema({
    bookingId: {
        type: String,
        required: true,
        // unique: trues
    },
    issue: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    uploadIssue: {
       type: [Document]
    }
})

module.exports = mongoose.model("userIssues", UserIssues)