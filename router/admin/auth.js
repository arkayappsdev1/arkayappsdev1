const express = require("express");
const { adminLogin } = require("../../controller/auth");

const router = express.Router();

router.route("/login").post(adminLogin);

module.exports = router;
