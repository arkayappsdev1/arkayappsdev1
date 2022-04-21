const express = require("express");
const {
    createIssueQuestion,
    updateIssueQuestion,
    deleteIssueQuestion
} = require("../../controller/issues");

const {adminProtect} = require('../../controller/auth')

const router = express.Router();

router.route("/createIssueQuestion").post(adminProtect ,createIssueQuestion);
router.route("/updateIssueQuestion").post(adminProtect ,updateIssueQuestion);
router.route("/deleteIssueQuestion").post(adminProtect ,deleteIssueQuestion);

module.exports = router;
