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
    controllers.productController.createNewProduct
  );

router
  .route("/:productId")
  .get(verifyJWT, controllers.productController.getProduct)
  .put(
    upload.single("imageSrc"),
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.MODERATOR]),
    controllers.productController.updateProduct
  )
  .delete(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.MODERATOR]),
    controllers.productController.deleteProduct
  );

router
  .route("/category/:categoryId")
  .get(verifyJWT, controllers.productController.getProductsByCategory);

// rating routes
router
  .route("/rating/rate-with-comment")
  .post(controllers.productRatingsController.rateProductWithComment);

router
  .route("/rating/rate-without-comment")
  .post(controllers.productRatingsController.rateProductWithoutComment);

// Get ratings for a product (no authentication required)
router.get("/rating/:productId", controllers.productRatingsController.getProductRatings);

// Delete rating (authentication required)
router.delete("/rating/:ratingId", verifyJWT, controllers.productRatingsController.deleteRating);

module.exports = router;
