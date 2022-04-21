const mogoose = require("mongoose");

const CountrySchema = new mogoose.Schema(
  {
    countryName: {
      type: "string",
      required: true,
    },
    countryCode: {
      type: "string",
      required: true,
      unique: true,
    },
    requireDocument : {
      type : Boolean
    },
    documentList : {
      type : [Object]
    }
  },
  { timestamps: { createdAt: "created_at" } }
);

const Country = mogoose.model("Country", CountrySchema);

module.exports = Country;
