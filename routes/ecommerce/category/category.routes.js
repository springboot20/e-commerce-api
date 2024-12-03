const express = require("express");
const { categoryController } = require("../../../controllers/index.controller");
const { verifyJWT, checkPermissions } = require("../../../middlewares/auth.middleware");
const { RoleEnums } = require("../../../constants");

const router = express.Router();

router
  .route("/")
  .get(verifyJWT, categoryController.getAllCategory)
  .post(verifyJWT, checkPermissions(RoleEnums.ADMIN), categoryController.createCategory);

router
  .route("/:categoryId")
  .get(verifyJWT, checkPermissions(RoleEnums.ADMIN), categoryController.getCategoryById)
  .patch(verifyJWT, checkPermissions(RoleEnums.ADMIN), categoryController.updateCategory)
  .delete(verifyJWT, checkPermissions(RoleEnums.ADMIN), categoryController.deleteCategory);

module.exports = router;
