const express = require('express');
const controllers = require('../controllers/index');
const router = express.Router();
const { authenticateUser, authorizePermission } = require('../middlewares/authenticateUser');

/**
 * PUBLIC ROUTES
 */
router.route('/register').post(controllers.authController.newUser);
router.route('/login').post(controllers.authController.login);
router.route('/:id').delete([authenticateUser, authorizePermission('admin')], controllers.userController.deleteUser);

/**
 * ADMIN ROUTES
 */
router.route('/').get([authenticateUser, authorizePermission('admin')], controllers.userController.getUsers);

/**
 * AUTHENTICATED USER ROUTES
 */
router.route('/:id').get(authenticateUser, controllers.userController.getUser);
router.route('/:id').put(authenticateUser, controllers.userController.updateUser);

module.exports = router;
