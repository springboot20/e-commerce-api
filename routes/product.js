const express = require('express');
const controllers = require('../controllers/index');
const router = express.Router();
const { isAdmin } = require('../utils/auth');

router.post('/', isAdmin, controllers.productController.newProduct);

module.exports = router;
