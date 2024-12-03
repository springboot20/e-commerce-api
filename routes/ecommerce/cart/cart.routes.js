const express = require("express");
const controllers = require("../../../controllers/index.controller");
const router = express.Router();
const { verifyJWT, checkPermissions } = require("../../../middlewares/auth.middleware");
const { RoleEnums } = require("../../../constants");

router
  .route("/")
  .get(verifyJWT, checkPermissions(RoleEnums.USER), controllers.cartController.getUserCart)
  .patch(verifyJWT, checkPermissions(RoleEnums.USER), controllers.cartController.clearCart);

router
  .route("/:productId")
  .post(verifyJWT, checkPermissions(RoleEnums.USER), controllers.cartController.addItemToCart)
  .patch(
    verifyJWT,
    checkPermissions(RoleEnums.USER),
    controllers.cartController.removeItemFromCart,
  );

module.exports = router;
