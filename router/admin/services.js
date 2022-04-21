const express = require('express');
const multer = require("multer")
const { createService, updateService, getServices, deleteService } = require('../../controller/admin/services');
const { getService } = require('../../controller/user/home')
const {adminProtect} = require('../../controller/auth')

const router = express.Router();

const ImgStorage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, "./uploads/services");
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
  
  const uploadServiceImg= multer({
    storage: ImgStorage,
    fileFilter: fileFilter,
  });


router.route("/createService").post(adminProtect, uploadServiceImg.single("imageUrl") ,createService);
router.route("/updateService").put(adminProtect, uploadServiceImg.single("imageUrl") ,updateService);
router.route("/getServices").get(adminProtect ,getServices);
router.route("/deleteService").delete(adminProtect ,deleteService);
router.route("/getService/:serviceId").get(adminProtect ,getService);

module.exports = router;