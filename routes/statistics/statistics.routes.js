const express = require("express");
const controllers = require("../../controllers/index.controller");
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { RoleEnums } = require("../../constants");

const router = express.Router();

router
  .route("/orders-stats")
  .get(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.MODERATOR]),
    controllers.statisticsController.ordersStatistics.getOrderStatistics,
  );

router
  .route("/products-stats")
  .get(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN, RoleEnums.MODERATOR]),
    controllers.statisticsController.productsStatistics.getProductsStatistics,
  );

module.exports = router;
