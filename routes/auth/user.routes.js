const express = require('express');
const controllers = require('../../controllers/index');
const router = express.Router();
const { verifyJWT, authorizePermission } = require('../../middlewares/auth.middleware');

/**
 * PUBLIC ROUTES
 */
router.route('/register').post(controllers.authController.register);
router.route('/signin').post(controllers.authController.signIn);
router
  .route('/:userId')
  .delete([verifyJWT, authorizePermission('admin')], controllers.userController.deleteUser);

/**
 * ADMIN ROUTES
 */
router
  .route('/')
  .get([verifyJWT, authorizePermission('admin')], controllers.userController.getUsers);

/**
 * AUTHENTICATED USER ROUTES
 */
router.route('/:id').get(verifyJWT, controllers.userController.getCurrentUser);
router.route('/:userId').put(verifyJWT, controllers.userController.updateUser);

module.exports = router;
