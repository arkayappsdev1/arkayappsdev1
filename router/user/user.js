const express = require("express");
const multer = require("multer");
const {
  editPhoneNumber,
  addUserAddress,
  getUserAddress,
  setSecurityQuestions,
  setUserProfile,
  getUserProfile,
  editAdditionalCustomerProfile,
  uploadDocument,
  deleteConsumerDocument,
  getListOfDocument,
  saveTrustedContact,
  getListOfTrustedContacts,
  deleteTrustedContact,
  updateTrustedContact,
} = require("../../controller/user/user");
const {
  loginWithPhoneNumber,
  verifyPhoneNumberByOtp,
  setPinCode,
  verifyPin,
  resendPhoneVarificationOtp,
  sendPinForPinRecovery,
  // verifyOtpForPinRecovery,
  verifySecurityQuestions,
  updatePin,
  emailVerificationRequest,
  verifyEmail,
  resendVerifyEmail,
  logout,
  protected
} = require("../../controller/auth");

const { getPerameters } = require("../../controller/user/perameters")

const router = express.Router();

// Upload Image and doc moddleware

const ImgStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/profilePic");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const docStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/documents");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

// const fileFilter = (req, file, callback) => {
//   if (
//     file.mimetype === "image/jpeg" ||
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg"
//   ) {
//     return callback(null, true);
//   }
//   return callback(null, false);
// };

const uploadPrfileImage = multer({
  storage: ImgStorage
});
const uploadDoc = multer({ storage: docStorage });

// ---------------  Middleware End --------------------------

router.route("/loginWithPhoneNumber").post(loginWithPhoneNumber);
router.route("/verifyPhoneNumberByOtp").post(verifyPhoneNumberByOtp);
router.route("/setPinCode/:userId").post(setPinCode);
router.route("/resendPhoneVarificationOtp").post(resendPhoneVarificationOtp);
router.route("/verifyPin").post(verifyPin);
router.route("/logout").get(logout);

// pin recovery
router.route("/sendPinForPinRecovery").post(sendPinForPinRecovery)
// router.route("/verifyOtpForPinRecovery/").post(verifyOtpForPinRecovery);
router.route("/verifySecurityQuestions").post(verifySecurityQuestions);
router.route("/updatePin").post(updatePin);

router.route("/emailVerificationRequest").post(emailVerificationRequest);
router.route("/verifyEmail").post(verifyEmail);
router.route("/resendOtpForVerifyEmail").post(resendVerifyEmail);
router.route("/editPhoneNumber").post(editPhoneNumber);

router.route("/addUserAddress/:id").post(addUserAddress);
router.route("/getUserAddress/:id").post(getUserAddress);

router.route("/setSecurityQuestions/:userId").post(setSecurityQuestions);
router.route("/getUserProfile/:userId").get(getUserProfile); //make common route for user and serviceprovider
router
  .route("/setUserProfile/:userId")
  .post(uploadPrfileImage.single("profilePic"), setUserProfile);

router
  .route("/editCustomerAdditionalProfile/:userId")
  .post(editAdditionalCustomerProfile);

router
  .route("/uploadDocument/:userId")
  .post(uploadDoc.any("document"), uploadDocument);

router.route("/deleteConsumerDocument").post(deleteConsumerDocument);
router
  .route("/getListOfDocument/:userId")
  .get(getListOfDocument);
router.route("/saveTrustedContact/:userId").post(saveTrustedContact);
router.route("/getListOfTrustedContacts/:userId").get(getListOfTrustedContacts);
router.route("/deleteTrustedContact").post(deleteTrustedContact);
router.route("/updateTrustedContact").post(updateTrustedContact);

// perameters
router.route("/getServiceParameters").get(getPerameters);

module.exports = router;
