const express = require('express');
const { addSecuretyQuestions, getListOfSecurityQuestions, updateSecurityQuestion, deleteSecurityQuestion } = require('../../controller/security');
const {adminProtect} = require('../../controller/auth')

const router = express.Router();

router.route("/addSecurityQuestions").post(adminProtect, addSecuretyQuestions)
router.route("/getSecurityQuestions").get(adminProtect, getListOfSecurityQuestions)
router.route("/updateSecurityQuestion").post(adminProtect, updateSecurityQuestion);
router.route("/deleteSecurityQuestion/:questionId").delete(adminProtect, deleteSecurityQuestion);


module.exports = router;