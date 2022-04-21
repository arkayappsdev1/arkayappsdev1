const express = require("express");

const {
  acceptServiceReq,
  DeclineServiceReq,
  reqAdditionalLaborMaterial,
  reqMoreTime,
  reqRescadule,
  getBookingList,
  taskDetails,
  verifyBookingOtp,
  cancelService,
  getEarnings,
  getDocuments,
  updateServiceStatus
} = require("../../controller/provider/services");

const router = express.Router();

router.route("/acceptServiceReq").post(acceptServiceReq);
router.route("/declineServiceReq").post(DeclineServiceReq);
router
  .route("/reqAdditionalLaborMaterial")
  .post(reqAdditionalLaborMaterial);
router.route("/reqMoreTime").post(reqMoreTime);
router.route("/reqRescadule").post(reqRescadule);
router.route("/getBookingList").post(getBookingList);
router.route("/taskDetails").post(taskDetails)
router.route("/verifyBookingOtp").post(verifyBookingOtp)
router.route("/cancelService").post(cancelService)
router.route("/getEarnings").get(getEarnings)
router.route("/getReqDocuments").get(getDocuments);
router.route("/updateServiceStatus").post(updateServiceStatus)

module.exports = router;