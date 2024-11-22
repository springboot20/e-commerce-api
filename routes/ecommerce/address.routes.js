const express = require("express");
const controllers = require("../../controllers/index");
const router = express.Router();
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { RoleEnums } = require("../../constants");

router
  .route("/")
  .post(verifyJWT, controllers.addressController.createAddress)
  .get(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN]),
    controllers.addressController.getAllAddresses,
  )
  .patch(verifyJWT, controllers.addressController.updateAddress)
  .delete(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.USER]),
    controllers.addressController.deleteAddress,
  );

router
  .route("/current-user")
  .get(
    verifyJWT,
    checkPermissions([RoleEnums.USER, RoleEnums.ADMIN]),
    controllers.addressController.getUserAddress,
  );

router
  .route("/:addressId")
  .get(verifyJWT, checkPermissions([RoleEnums.ADMIN]), controllers.addressController.getUserAddress)
  .delete(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.USER]),
    controllers.addressController.deleteAddress,
  );

module.exports = router;
