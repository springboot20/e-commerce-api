const express = require('express');
const router = express.Router();
const controllers = require('../../controllers/index');
const { verifyJWT, checkPermissions } = require('../../middlewares/auth.middleware');
const { RoleEnums } = require('../../constants');

router.route('/provider/paypal').post(verifyJWT, controllers.orderController.generatePaypalOrder);

router
  .route('/provider/paypal/verify-payment')
  .post(verifyJWT, controllers.orderController.verifyPaypalOrder);

router
  .route('/status/:orderId')
  .patch(
    verifyJWT,
    checkPermissions([RoleEnums.ADMIN]),
    controllers.orderController.updateOrderStatus
  );

module.exports = router;
