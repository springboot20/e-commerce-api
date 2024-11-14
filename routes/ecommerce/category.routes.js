const express = require('express');
const controllers = require('../../controllers/index');
const { verifyJWT, checkPermissions } = require('../../middlewares/auth.middleware');
const { RoleEnums } = require('../../constants');
const router = express.Router();

router
  .route('/')
  .get(verifyJWT, controllers.categoryController.getAllCategory)
  .post(
    verifyJWT,
    checkPermissions(RoleEnums.ADMIN),
    controllers.categoryController.createCategory
  );

router
  .route('/:categoryId')
  .get(verifyJWT, checkPermissions(RoleEnums.ADMIN), controllers.categoryController.getCategoryById)
  .patch(
    verifyJWT,
    checkPermissions(RoleEnums.ADMIN),
    controllers.categoryController.updateCategory
  )
  .delete(
    verifyJWT,
    checkPermissions(RoleEnums.ADMIN),
    controllers.categoryController.deleteCategory
  );

module.exports = router;
