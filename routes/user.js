const express = require('express');
const controller = require('../controllers/index');
const router = express.Router();
const { auth, isAdmin } = require('../utils/auth');

router.get('/');
router.post('/register', controller.authController.newUser);
router.post('/login', auth, controller.authController.login);
router.put('/:id', auth, controller.userController.updateUser);

module.exports = router;
