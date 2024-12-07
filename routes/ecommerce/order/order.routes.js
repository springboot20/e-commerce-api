const express = require("express");
const controllers = require("../../../controllers/index.controller");
const { verifyJWT, checkPermissions } = require("../../../middlewares/auth.middleware");
const { RoleEnums } = require("../../../constants");

const router = express.Router();

router
  .route("/provider/paystack")
  .post(verifyJWT, controllers.orderController.generatePaystackOrder);

router.route("/").get(verifyJWT, controllers.orderController.getAllOrders);

router
  .route("/provider/paystack/verify-callback")
  .get(verifyJWT, controllers.orderController.orderFulfillmentHelper);

router
  .route("/status/:orderId")
  .patch(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN]),
    controllers.orderController.updateOrderStatus,
  );

module.exports = router;
