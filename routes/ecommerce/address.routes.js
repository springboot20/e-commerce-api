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
  );

router
  .route("/:addressId")
  .get(verifyJWT, controllers.addressController.getAddressById)
  .patch(verifyJWT, controllers.addressController.updateAddress)
  .delete(verifyJWT, controllers.addressController.deleteAddress);

module.exports = router;
