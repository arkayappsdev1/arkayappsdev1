const express = require('express');
const multer = require("multer")
const { createSubService,  updateSubService, deleteSubService, getSubServices, getSubServiceDetils } = require('../../controller/admin/subService')
const { getSubService } = require('../../controller/user/subService')
const {adminProtect} = require('../../controller/auth')


const router = express.Router();



// add or update subservice images
const ImgStorage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, "./uploads/subServices");
    },
    filename: function (req, file, callback) {
      callback(null,file.fieldname + "_" + Date.now() + "_" + file.originalname);
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
  
  const uploadSubserviceImage = multer({
    storage: ImgStorage,
    fileFilter: fileFilter,
  });

//   ---------------------------------------------------------------------


router.route("/createSubService").post(adminProtect, uploadSubserviceImage.single("imageUrl"), createSubService);
router.route("/getSubServiceList").post(adminProtect, getSubServices);
router.route("/getSubServiceDetails").post(adminProtect, getSubServiceDetils);
router.route("/updateSubService").put(adminProtect, uploadSubserviceImage.single("imageUrl"), updateSubService);
router.route("/deleteSubService").post(adminProtect, deleteSubService);

module.exports = router;