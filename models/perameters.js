const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceReqData = new Schema({
  maxImages: {
    type: "Number",
  },
  maxImageSize: {
    type: "Number",
    default: 3000000,
  },
});

const otpData = new Schema({
  tamplate_id: { type: "String" },
  auth_id: { type: "String" },
  resend_otp_type: { type: "String", enum: ["text", "Voice"] },
  type: { type: "String", enum: ["development", "production"]}
});

const Perameters = new Schema({
  serviceRequest: {
    type: serviceReqData,
  },
  otpData: { type: otpData, select : false },
});

const ChangingPerameters = mongoose.model("Perameters", Perameters);

module.exports = ChangingPerameters;
