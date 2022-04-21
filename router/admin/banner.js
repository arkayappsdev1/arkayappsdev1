const express = require("express");
const multer = require("multer");
const {
  addBanner,
  bannerList,
  deleteBanner,
  bannerDetails,
  updateBanner,
} = require("../../controller/admin/banner");
const { adminProtect } = require("../../controller/auth");

const router = express.Router();

const ImgStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/banners");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    return callback(null, true);
  }
  return callback(null, false);
};

const uploadBannerImage = multer({
  storage: ImgStorage,
  fileFilter: fileFilter,
});

router
  .route("/addBanner")
  .post(adminProtect, uploadBannerImage.single("imagePath"), addBanner);
router
  .route("/updateBanner")
  .post(adminProtect, uploadBannerImage.single("imagePath"), updateBanner);
router.route("/bannerList").get(adminProtect, bannerList);
router.route("/deleteBanner").delete(adminProtect, deleteBanner);
router.route("/bannerDetails").get(adminProtect, bannerDetails);

module.exports = router;
