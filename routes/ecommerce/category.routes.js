const express = require("express");
const controllers = require("../../controllers/index");
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { RoleEnums } = require("../../constants");
const router = express.Router();

router
  .route("/")
  .get(verifyJWT, controllers.categoryController.getAllCategory)
  .post(
    verifyJWT,
    checkPermissions(RoleEnums.ADMIN),
    controllers.categoryController.createCategory,
  );

module.exports = router;
