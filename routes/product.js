const express = require('express');
const controllers = require('../controllers/index');
const router = express.Router();
const { authenticateUser, authorizePermission } = require('../middlewares/authenticateUser');

router.route('/').post([authenticateUser, authorizePermission('admin')], controllers.productController.newProduct);

module.exports = router;
