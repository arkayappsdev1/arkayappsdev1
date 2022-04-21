const express = require("express");
const multer = require("multer");

const {
  setupCatagory,
  getCatagoryList,
  // changeCategoryStatus,
  getCatagoryDetails
} = require("../../controller/provider/catagory");

const router = express.Router();

const docStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/categoryDocumets");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const uploadDoc = multer({ storage: docStorage });

router.route("/getCatagoryList").get(getCatagoryList);
router.route("/setupCatagory").post(uploadDoc.any("categoryDocumet") ,setupCatagory);
router.route("/getServiceCategoryDetails").post(getCatagoryDetails);
// router.route("/changeCategoryStatus").post(changeCategoryStatus)

module.exports = router;
