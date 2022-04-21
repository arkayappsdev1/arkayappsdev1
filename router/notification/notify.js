const express = require('express');
const pushNotifications = require('../../utils/notification')
const router = express.Router();


router.route("/pushNotification").post(pushNotifications)

module.exports = router;
