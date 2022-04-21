const axios = require("axios");
const OtpData = require("../models/perameters");

const sendOtp = async (req) => {
  const otpId = process.env.OTP_ID;
  const otpData = await OtpData.findById(otpId).select("+otpData");
  return axios.get(
    `https://api.msg91.com/api/v5/otp?template_id=${otpData.otpData.tamplate_id}&mobile=${req.body.mobileNumber}&authkey=${otpData.otpData.auth_id}`
  );
};

module.exports = { sendOtp };
