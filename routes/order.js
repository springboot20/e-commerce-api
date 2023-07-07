const express = require('express');
const router = express.Router();
const controllers = require('../controllers/index');
const { auth, isAdmin } = require('../utils/auth');

router.get('/', isAdmin, controllers.orderController.getOrders);
router.get('/:userId', auth, controllers.orderController.getOrder);
router.get('/income', isAdmin, controllers.orderController.monthlyIncome);
router.post('/', isAdmin, controllers.orderController.placeOrder);
router.put('/:id', isAdmin, controllers.orderController.updateOrder);
router.delete('/:id', isAdmin, controllers.orderController.deleteOrder);

module.exports = router;
