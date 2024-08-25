const express = require("express");
const controllers = require("../../controllers/index");
const router = express.Router();
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { RoleEnums } = require("../../constants");

router
  .route("/")
  .get(verifyJWT, controllers.cartController.getUserCart)
  .patch(verifyJWT, controllers.cartController.clearCart);

router
  .route("/:productId")
  .get(verifyJWT, controllers.cartController.addItemToCart)
  .patch(verifyJWT, controllers.cartController.removeItemFromCart);

module.exports = router;
