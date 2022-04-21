const express = require('express');
const {getServices, getService, getBanners, searchServices, getPopularServices} = require('../../controller/user/home');
// const {protected} = require('../../controller/auth')

const router = express.Router();

router.route("/getBannerList").post(getBanners)
router.route("/getServiceList").post(getServices)
router.route("/getServiceDetails/:serviceId").get(getService)
router.route("/findService").get(searchServices)
router.route("/getPopularServices").post(getPopularServices)



module.exports = router;