const express = require('express');
const {getListOfSecurityQuestions } = require('../../controller/security');

const router = express.Router();

router.route("/getListOfSecurityQuestions").get(getListOfSecurityQuestions)


module.exports = router;