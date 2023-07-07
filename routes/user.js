const express = require('express');
const controllers = require('../controllers/index');
const router = express.Router();
const { auth, isAdmin } = require('../utils/auth');

router.get('/', isAdmin, controllers.userController.getUsers);
router.get('/user/:id', isAdmin, controllers.userController.getUser);
router.get('/stats', isAdmin, controllers.userController.usersStats);
router.post('/register', controllers.authController.newUser);
router.post('/login', controllers.authController.login);
router.put('/:id', auth, controllers.userController.updateUser);
router.delete('/:id', auth, controllers.userController.deleteUser);

module.exports = router;
