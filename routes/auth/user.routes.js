const express = require("express");
const controllers = require("../../controllers/index.controller");
const router = express.Router();
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { upload } = require("../../middlewares/upload.middleware");
const { RoleEnums } = require("../../constants");
const { registerValidator, loginValidator } = require("../../validation/auth/user.validation");
const validate = require("../../validation/validate");

/**
 * PUBLIC ROUTES
 */
router.route("/register").post(registerValidator(), validate, controllers.authController.register);

router.route("/login").post(loginValidator(), validate, controllers.authController.login);

router.route("/verify-email/:id/:token").get(controllers.emailController.emailVerification);

router.route("/forgot-password/").post(controllers.emailController.forgotPassword);

router.route("/reset-password/:token").post(controllers.authController.resetForgottenPassword);

/**
 * ADMIN ROUTES
 */
router
  .route("/")
  .get(verifyJWT, checkPermissions(RoleEnums.ADMIN), controllers.userController.getUsers);

router
  .route("/verified-users")
  .get(verifyJWT, checkPermissions(RoleEnums.ADMIN), controllers.userController.getVerifiedUsers);

router
  .route("/:userId")
  .delete(verifyJWT, checkPermissions(RoleEnums.ADMIN), controllers.userController.deleteUser)
  .patch(verifyJWT, checkPermissions(RoleEnums.ADMIN), controllers.userController.updateUser);

router
  .route("/assign-role/:userId")
  .post(
    verifyJWT,
    checkPermissions(RoleEnums.ADMIN, RoleEnums.MODERATOR),
    controllers.authController.assignRole,
  );

/**
 * AUTHENTICATED USER ROUTES
 */
router.route("/change-password").post(verifyJWT, controllers.userController.changeCurrentPassword);

router.route("/current-user/:userId").get(verifyJWT, controllers.userController.getCurrentUser);

router.route("/logout").post(verifyJWT, controllers.authController.logOut);

router
  .route("/resend-email-verification")
  .post(controllers.emailController.resendEmailVerification);

router
  .route("/upload-avatar")
  .post(verifyJWT, upload.single("avatar"), controllers.userController.updateUserAvatar);

module.exports = router;
