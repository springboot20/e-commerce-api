const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/index");
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { RoleEnums } = require("../../constants");

router
  .route("/")
  .get([verifyJWT, checkPermissions([RoleEnums.ADMIN])], controllers.orderController.getOrders);

router.get("/:userId", verifyJWT, controllers.orderController.getOrder);

router
  .route("/income")
  .get([verifyJWT, checkPermissions([RoleEnums.ADMIN])], controllers.orderController.monthlyIncome);

router
  .route("/")
  .post([verifyJWT, checkPermissions([RoleEnums.ADMIN])], controllers.orderController.placeOrder);

router
  .route("/:id")
  .put([verifyJWT, checkPermissions([RoleEnums.ADMIN])], controllers.orderController.updateOrder)
  .delete(
    [verifyJWT, checkPermissions([RoleEnums.ADMIN])],
    controllers.orderController.deleteOrder,
  );

module.exports = router;
