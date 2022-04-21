const Perameters = require("../../models/perameters");
const { catchErr } = require("../../error");

const UpdatePerameters = async (req, res) => {
  try {
    const id = process.env.OTP_ID;

    const { maxImages, maxImageSize, auth_id, tamplate_id, type, resend_otp_type } = req.body;

    await Perameters.findByIdAndUpdate(id, {
      "serviceRequest.maxImages": maxImages,
      "serviceRequest.maxImageSize": maxImageSize,
      "otpData.tamplate_id" : tamplate_id,
      "otpData.auth_id" : auth_id,
      "otpData.resend_otp_type" : resend_otp_type,
      "otpData.type" : type
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: "parameter updated successfully",
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getPerameters = async (req, res) => {
  try {
    const id = process.env.OTP_ID;

    const getPeramter = await Perameters.findById(id).select("+otpData");

    res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data : getPeramter
    })
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = { UpdatePerameters, getPerameters };
