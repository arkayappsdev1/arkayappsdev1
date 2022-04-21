const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Experience = new Schema(
  {
    experienceQuestion: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("experience", Experience);
