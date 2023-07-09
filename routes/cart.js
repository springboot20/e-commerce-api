const express = require('express');
const router = express.Router();
const controllers = require('../controllers/index');
const { authenticateUser, authorizePermission } = require('../middlewares/authenticateUser');

router.get('/cart/:userId', authenticateUser, controllers.cartController.getCart);
router.route('/').get(authenticateUser, authorizePermission('admin'), controllers.cartController.getCarts);
router.post('/', authenticateUser, controllers.cartController.addToCart);
router.put('/:id', authenticateUser, controllers.cartController.updateCart);
router.delete('/:id', authenticateUser, controllers.cartController.deleteCart);

module.exports = router;
