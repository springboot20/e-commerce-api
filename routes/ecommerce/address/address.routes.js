const express = require("express");
const { addressController } = require("../../../controllers/index.controller");
const { verifyJWT, checkPermissions } = require("../../../middlewares/auth.middleware");
const { RoleEnums } = require("../../../constants");

const router = express.Router();

router
  .route("/")
  .post(verifyJWT, addressController.createAddress)
  .get(verifyJWT, checkPermissions([RoleEnums.ADMIN]), addressController.getAllAddresses)
  .patch(verifyJWT, addressController.userAddress.updateAddress);

router
  .route("/current-user")
  .get(verifyJWT, checkPermissions([RoleEnums.USER]), addressController.userAddress.getUserAddress)
  .delete(
    verifyJWT,
    checkPermissions([RoleEnums.USER]),
    addressController.userAddress.deleteUserAddress,
  );

router
  .route("/:addressId")
  .get(verifyJWT, checkPermissions([RoleEnums.ADMIN]), addressController.userAddress.getUserAddress)
  .delete(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN]),
    addressController.userAddress.deleteAddress,
  );

module.exports = router;
