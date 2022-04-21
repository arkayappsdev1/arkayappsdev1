const express = require("express");
const {
  userList,
  getUser,
  deleteUser,
  getCatagory,
  updateUser,
  deleteCatagory,
  updateCatagory,
  getCatagoryDocument,
  updateDocument,
} = require("../../controller/admin/users");
const {
  getDocumentMaster,
  addDocumentsInMaster,
  updateDocumentInMaster,
  deleteDocumentInMaster,
} = require("../../controller/admin/documentMater");
const { adminProtect } = require("../../controller/auth");

const { UpdatePerameters, getPerameters } = require("../../controller/admin/perameters");

const router = express.Router();

router.route("/userList").get(adminProtect, userList);
router.route("/getUser/:userId").get(adminProtect, getUser);
router.route("/deleteUser/:userId").delete(adminProtect, deleteUser);
router.route("/updateUser").put(adminProtect, updateUser);

router.route("/getCatagory").get(adminProtect, getCatagory);
router.route("/deleteCatagory").get(adminProtect, deleteCatagory);
router.route("/updateCatagory").put(adminProtect, updateCatagory);

router.route("/getCatagoryDocument").post(adminProtect, getCatagoryDocument);
router
  .route("/updateDocument")
  .post(adminProtect, updateDocument);

router.route("/updatePerameters").put(adminProtect, UpdatePerameters);
router.route("/getServiceParameters").get(adminProtect, getPerameters);

// document master
router.route("/getDocumentMaster").get(adminProtect, getDocumentMaster);
router.route("/addDocumentsInMaster").post(adminProtect, addDocumentsInMaster);
router
  .route("/updateDocumentInMaster")
  .put(adminProtect, updateDocumentInMaster);
router
  .route("/deleteDocumentInMaster")
  .delete(adminProtect, deleteDocumentInMaster);

module.exports = router;
