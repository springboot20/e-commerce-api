const express = require("express");
const controllers = require("../../../controllers/index.controller");
const { verifyJWT, checkPermissions } = require("../../../middlewares/auth.middleware");
const { RoleEnums } = require("../../../constants");
const { upload } = require("../../../middlewares/upload.middleware");

const router = express.Router();

router
  .route("/")
  .get(controllers.productController.getAllProducts)
  .post(
    upload.single("imageSrc"),
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.MODERATOR]),
    controllers.productController.createNewProduct,
  );

router
  .route("/:productId")
  .get(verifyJWT, controllers.productController.getProduct)
  .put(
    upload.single("imageSrc"),
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.MODERATOR]),
    controllers.productController.updateProduct,
  )
  .delete(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.MODERATOR]),
    controllers.productController.deleteProduct,
  );

router
  .route("/category/:categoryId")
  .get(verifyJWT, controllers.productController.getProductsByCategory);

module.exports = router;
