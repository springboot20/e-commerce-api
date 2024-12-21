const express = require("express");
const controllers = require("../../../controllers/index.controller");
const { verifyJWT, checkPermissions } = require("../../../middlewares/auth.middleware");
const { RoleEnums } = require("../../../constants");

const router = express.Router();

router
  .route("/provider/paystack")
  .post(verifyJWT, controllers.orderController.generatePaystackOrder);

router
  .route("/")
  .get(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.MODERATOR]),
    controllers.orderController.getAllOrders,
  );

router
  .route("/user-orders")
  .get(verifyJWT, checkPermissions([RoleEnums.USER]), controllers.orderController.getUserOrders);

router
  .route("/provider/paystack/verify-callback")
  .get(verifyJWT, controllers.orderController.orderFulfillmentHelper);

router
  .route("/:orderId")
  .get(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.USER, RoleEnums.MODERATOR]),
    controllers.orderController.getOrderById,
  );

router
  .route("/status/:orderId")
  .patch(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN]),
    controllers.orderController.updateOrderStatus,
  );

module.exports = router;
