const Perameters = require("../../models/perameters");
const { catchErr } = require("../../error");

const getPerameters = async (req, res) => {
  try {
    const id = process.env.OTP_ID;

    const getPeramter = await Perameters.findById(id);

    res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data : getPeramter
    })
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = { getPerameters };
