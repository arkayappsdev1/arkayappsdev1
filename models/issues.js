const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Issues = new Schema(
  {
    issueQuestion: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("issues", Issues);
