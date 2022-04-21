const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Security = new Schema(
  {
    question: {
      type: String,
      required: true,
      lowercase: true,
    }
  },
  {
    collection: "SecurityQuestions",
  }
);

module.exports = mongoose.model("SecurityQuestion", Security);
