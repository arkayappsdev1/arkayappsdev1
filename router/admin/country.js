const express = require('express');
const {addCountry, countryList, deleteCountry, updateCountry, getCountry} = require('../../controller/admin/country');
const {adminProtect} = require('../../controller/auth')

const router = express.Router();

router.route("/addCountry").post(adminProtect, addCountry)
router.route("/countryList").get(adminProtect, countryList)
router.route("/deleteCountry").delete(adminProtect, deleteCountry)
router.route("/updateCountry").put(adminProtect, updateCountry)
router.route("/getCountry").get(adminProtect, getCountry)

module.exports = router;