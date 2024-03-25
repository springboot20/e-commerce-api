const express = require('express');
const router = express.Router();
const controllers = require('../../controllers/index');
const { authenticateUser, authorizePermission } = require('../../middlewares/auth.middleware');

router
  .route('/')
  .get([authenticateUser, authorizePermission('admin')], controllers.orderController.getOrders);
router.get('/:userId', authenticateUser, controllers.orderController.getOrder);
router
  .route('/income')
  .get([authenticateUser, authorizePermission('admin')], controllers.orderController.monthlyIncome);
router
  .route('/')
  .post([authenticateUser, authorizePermission('admin')], controllers.orderController.placeOrder);
router
  .route('/:id')
  .put([authenticateUser, authorizePermission('admin')], controllers.orderController.updateOrder);
router
  .route('/:id')
  .delete(
    [authenticateUser, authorizePermission('admin')],
    controllers.orderController.deleteOrder
  );

module.exports = router;
