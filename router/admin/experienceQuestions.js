const express = require("express");
const {
  createExperienceQuestion,
  updateExperienceQuestion,
  deleteExperienceQuestion,
} = require("../../controller/experienceQuestion");

const {
  getExperieceQuestionsList,
} = require("../../controller/user/services")

const {adminProtect} = require('../../controller/auth')

const router = express.Router();

router.route("/createExperienceQuestion").post(adminProtect ,createExperienceQuestion);
router.route("/getExperieceQuestionsList").get(adminProtect ,getExperieceQuestionsList);
router.route("/updateExperienceQuestion").post(adminProtect ,updateExperienceQuestion);
router.route("/deleteExperienceQuestion/:questionId").delete(adminProtect ,deleteExperienceQuestion);

module.exports = router;
