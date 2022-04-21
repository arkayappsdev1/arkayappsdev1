const express = require("express");
const multer = require("multer");

const {
  requestService,
  updatePaymentInfo,
  cancelServiceRequrest,
  getListOfLocalProviders,
  getBookingsList,
  getBookingDetails,
  addToFavouriteProviderList,
  getProviderResponseList,
  getProviderCostDetails,
  acceptProviderResponse,
  getReqForReshedule,
  approveOrDeclineRescadule,
  getReqForAdditionalLaborMaterial,
  approveOrDeclineAdditionalLaborMaterial,
  approveOrDeclineAdditionalTime,
  getReqForAdditionalTime,
  addRatingToProvider,
  deleteProviderRating,
  removeFromFev,
  getFevProviderList,
  getAvoidProvidersList,
  addToAvoidProvidersList,
  removeFromAvoidProvidersList,
  getExperieceQuestionsList,
  getExperieceQuestion,
  getIssueQuestionsList,
  getIssueQuestion,
  submitUserIssue,
  updateUserIssues,
  deleteUserIssue,
  getServiceHistory,
  uploadCompletedTask
} = require("../../controller/user/services");

const { protected } = require("../../controller/auth");

const router = express.Router();

// Upload Image and doc moddleware

const docStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/taskImages");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const issueStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/issueDocuments");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const uploadDoc = multer({ storage: docStorage });
const uploadIssue = multer({ storage: issueStorage });

// ---------------  Middleware End --------------------------

router
  .route("/createNewServiceRequest")
  .post(uploadDoc.any("taskImages"), requestService);

router.route("/updatePaymentInfo").post(updatePaymentInfo);

router.route("/cancelServiceRequrest/:bookingId").get(cancelServiceRequrest);
router.route("/getBookingsList").post(getBookingsList);
router.route("/getBookingDetails").get(getBookingDetails);

router.route("/getProviderResponseList").get(getProviderResponseList);
router.route("/getProviderCostDetails").get(getProviderCostDetails);
router.route("/acceptProviderResponse").post(acceptProviderResponse);

router.route("/getReqForReshedule").get(getReqForReshedule);
router.route("/approveOrDeclineRescadule").post(approveOrDeclineRescadule);

router.route("/getReqForAdditionalTime").get(getReqForAdditionalTime);
router
  .route("/approveOrDeclineAdditionalTime")
  .post(approveOrDeclineAdditionalTime);

router
  .route("/getReqForAdditionalLaborMaterial")
  .get(getReqForAdditionalLaborMaterial);
router
  .route("/approveOrDeclineAdditionalLaborMaterial")
  .post(approveOrDeclineAdditionalLaborMaterial);
router.route("/addRatingToProvider").post(addRatingToProvider);
router.route("/deleteProviderRating").post(deleteProviderRating);
router.route("/getExperieceQuestionsList").get(getExperieceQuestionsList);
router.route("/getExperieceQuestion/:questionId").get(getExperieceQuestion);

router.route("/getIssueQuestionsList").get(getIssueQuestionsList);
router.route("/getIssueQuestion/:questionId").get(getIssueQuestion);
router
  .route("/submitUserIssue")
  .post(uploadIssue.any("document"), submitUserIssue);
router
  .route("/updateUserIssues")
  .post(uploadIssue.any("document"), updateUserIssues);

router.route("/uploadCompletedTaskImages").post(uploadDoc.any("taskImages"), uploadCompletedTask);
router.route("/deleteUserIssue").get(deleteUserIssue);
router.route("/getServiceHistory/:userId").get(getServiceHistory);

router.route("/getFevoriteProviderList/:userId").post(getFevProviderList);
router.route("/addToFavouriteProviderList").post(addToFavouriteProviderList);
router.route("/removeFromFavouriteProviderList").post(removeFromFev);

router.route("/getAvoidProvidersList/:userId").get(getAvoidProvidersList);
router.route("/addToAvoidProvidersList").post(addToAvoidProvidersList);
router
  .route("/removeFromAvoidProvidersList")
  .post(removeFromAvoidProvidersList);

router.route("/getLocalProvidersList").get(getListOfLocalProviders);

module.exports = router;
