const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DocumentMasterSchema = new Schema(
  {
    documentName: {
      type: String,
      // required: true
    },
    documentFor: {
      type: String,
    },
  }
);

const DocumentMaster = mongoose.model("DocumentMaster", DocumentMasterSchema);

module.exports = DocumentMaster;
