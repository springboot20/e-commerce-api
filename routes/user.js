const express = require('express');
const controller = require('../controllers/index');
const router = express.Router();
const { auth, isAdmin } = require('../utils/auth');

router.get('/', isAdmin, controller.userController.getUsers);
router.get('/user/:id', isAdmin, controller.userController.getUser);
router.get('/stats', isAdmin, controller.userController.usersStats);
router.post('/register', controller.authController.newUser);
router.post('/login', controller.authController.login);
router.put('/:id', auth, controller.userController.updateUser);
router.delete('/:id', auth, controller.userController.deleteUser);

module.exports = router;
