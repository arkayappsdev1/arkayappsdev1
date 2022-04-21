const express = require("express");
const {bookingList, getBooking, deleteBooking, paymentDetails } = require("../../controller/admin/bookings")
const {adminProtect} = require('../../controller/auth')


const router = express.Router();

router.route("/bookingList").get(adminProtect, bookingList)
router.route("/getBooking/:bookingId").get(adminProtect, getBooking)
router.route("/deleteBooking/:bookingId").delete(adminProtect, deleteBooking)
router.route("/paymentDetails").get(adminProtect, paymentDetails)

module.exports = router