const express = require('express');
const { getSubServices,getSubService, subServiceSearch} = require('../../controller/user/subService');

const router = express.Router();

router.route("/getSubServiceList").post(getSubServices);
router.route("/getSubServiceDetails").post(getSubService);
router.route("/findSubService").get(subServiceSearch)

module.exports = router;