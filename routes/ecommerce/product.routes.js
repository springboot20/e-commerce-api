const express = require("express");
const controllers = require("../../controllers/index");
const router = express.Router();
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { RoleEnums, MAX_SUB_IMAGES_TO_BE_UPLOAD } = require("../../constants");
const { upload } = require("../../middlewares/upload.middleware");

router
  .route("/")
  .get(controllers.productController.getAllProducts)
  .post(
    upload.fields([
      {
        name: "imageSrc",
        maxCount: 1,
      },
      {
        name: "subImgs",
        maxCount: MAX_SUB_IMAGES_TO_BE_UPLOAD,
      },
    ]),
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN]),
    controllers.productController.createNewProduct,
  );

router
  .route("/:productId")
  .get(verifyJWT, controllers.productController.getProduct)
  .patch(
    checkPermissions([RoleEnums.ADMIN]),
    verifyJWT,
    upload.fields([
      {
        name: "imageSrc",
        maxCount: 1,
      },
      {
        name: "subImgs",
        maxCount: MAX_SUB_IMAGES_TO_BE_UPLOAD,
      },
    ]),
    controllers.productController.updateProduct,
  )
  .delete(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN]),
    controllers.productController.deleteProduct,
  );

router
  .route("/category/:categoryId")
  .get(verifyJWT, controllers.productController.getProductsByCategory);

router
  .route("/remove/subImg/:productId/:subImageId")
  .get(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN]),
    controllers.productController.removeImageSubImage,
  );

module.exports = router;
