const express = require("express");
const controllers = require("../../controllers/index");
const router = express.Router();
const { verifyJWT, authorizePermission } = require("../../middlewares/auth.middleware");
const { upload } = require("../../middlewares/upload.middleware");

/**
 * PUBLIC ROUTES
 */
router.route("/register").post(controllers.authController.register);

router.route("/login").post(controllers.authController.login);

router.route("/send-email").post(controllers.emailController.sendEmailVerification);

router.route("/verify-email/:id/:token").post(controllers.emailController.emailVerification);

router.route("/forgot-password/").post(controllers.emailController.forgotPassword);

router.route("/reset-password/:token").post(controllers.authController.resetForgottenPassword);

/**
 * ADMIN ROUTES
 */
router
  .route("/")
  .get([verifyJWT, authorizePermission("admin")], controllers.userController.getUsers)
  .get([verifyJWT, authorizePermission("admin")], controllers.userController.getVerifiedUsers);

router
  .route("/:userId")
  .delete([verifyJWT, authorizePermission("admin")], controllers.userController.deleteUser);

/**
 * AUTHENTICATED USER ROUTES
 */
router
  .route("/")
  .get(verifyJWT, controllers.userController.getCurrentUser)
  .put(verifyJWT, controllers.userController.updateUser);

router.route("/logout").post(verifyJWT, controllers.authController.logOut);

router
  .route("/:id")
  .post(verifyJWT, authorizePermission("admin"), controllers.authController.assignRole);

router
  .route("/avatar")
  .put(upload.single("avatar"), verifyJWT, controllers.userController.updateUserAvatar);

module.exports = router;
