const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/index");
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { RoleEnums } = require("../../constants");

router
  .route("/provider/paystack")
  .post(verifyJWT, controllers.orderController.generatePaystackOrder);

router
  .route("/provider/paystack/verify")
  .post(verifyJWT, controllers.orderController.orderFulfillmentHelper);

router
  .route("/status/:orderId")
  .patch(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN]),
    controllers.orderController.updateOrderStatus,
  );

module.exports = router;
