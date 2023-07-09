const express = require('express');
const controllers = require('../controllers/index');
const router = express.Router();
const { authenticateUser, authorizePermission } = require('../middlewares/authenticateUser');

router.route('/').get(authenticateUser, authorizePermission('admin'), controllers.userController.getUsers);
router.get('/:id', authenticateUser, controllers.userController.getUser);
router.post('/register', controllers.authController.newUser);
router.post('/login', controllers.authController.login);
router.put('/:id', authenticateUser, controllers.userController.updateUser);
router.delete('/:id', authenticateUser, controllers.userController.deleteUser);

module.exports = router;
