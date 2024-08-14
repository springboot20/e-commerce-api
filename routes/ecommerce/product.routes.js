const express = require("express");
const controllers = require("../../controllers/index");
const router = express.Router();
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { RoleEnums } = require("../../constants");

router
  .route("/")
  .post(
    [verifyJWT, checkPermissions([RoleEnums.ADMIN])],
    controllers.productController.createNewProduct,
  );

module.exports = router;
