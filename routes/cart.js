const express = require('express');
const router = express.Router();
const controllers = require('../controllers/index');
const { auth, isAdmin } = require('../utils/auth');

router.get('/cart/:userId', auth, controllers.cartController.getCart);
router.get('/', isAdmin, controllers.cartController.getCarts);
router.post('/', auth, controllers.cartController.addToCart);
router.put('/:id', auth, controllers.cartController.updateCart);
router.delete('/:id', auth, controllers.cartController.deleteCart);

module.exports = router;
