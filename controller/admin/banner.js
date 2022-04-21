const Banners = require("../../models/banner");
const { catchErr } = require("../../error");

const addBanner = async (req, res) => {
  const {
    status,
    ownerName,
    startDate,
    expireDate,
    description,
    country,
    redirectUrl,
  } = req.body;

  try {
    const banner = {
      imagePath: req.file.filename,
      status,
      page: JSON.parse(req.body.page),
      description,
      country,
      userNature: JSON.parse(req.body.appType), //new
      userType : JSON.parse(req.body?.userType), //new
      ownerName,
      startDate,
      expireDate,
      redirectUrl,
    };
    const addBanner = await Banners.create(banner);

    res.status(200).json({
      status: "success",
      banner: addBanner,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const bannerList = async (req, res) => {
  try {
    const bannerList = await Banners.find();

    res.status(200).json({
      statusCode: 200,
      status: "success",
      data: bannerList,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.query;

    await Banners.findByIdAndDelete(bannerId);

    return res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_42"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const bannerDetails = async (req, res) => {
  try {
    const { bannerId } = req.query;

    const banner = await Banners.findById(bannerId);

    return res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: banner,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateBanner = async (req, res) => {
  try {
    const { bannerId } = req.query;
    const {
      status,
      ownerName,
      startDate,
      expireDate,
      description,
      country,
      redirectUrl,
    } = req.body;

    await Banners.findByIdAndUpdate(bannerId, {
      imagePath: req.file?.filename,
      status,
      page: JSON.parse(req.body.page),
      description,
      country,
      userNature: JSON.parse(req.body.appType), //new
      userType : JSON.parse(req.body?.userType), //new
      ownerName,
      startDate,
      expireDate,
      redirectUrl,
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_43"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = {
  addBanner,
  bannerList,
  deleteBanner,
  bannerDetails,
  updateBanner,
};
