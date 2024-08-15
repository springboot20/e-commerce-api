const express = require("express");
const controllers = require("../../controllers/index");
const router = express.Router();
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { upload } = require("../../middlewares/upload.middleware");
const { RoleEnums } = require("../../constants");

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
  .get(verifyJWT, checkPermissions(RoleEnums.ADMIN), controllers.userController.getUsers);

router
  .route("/verified-users")
  .get(verifyJWT, checkPermissions(RoleEnums.ADMIN), controllers.userController.getVerifiedUsers);

router
  .route("/:userId")
  .delete(verifyJWT, checkPermissions(RoleEnums.ADMIN), controllers.userController.deleteUser);

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

router
  .route("/")
  .patch(verifyJWT, controllers.userController.updateUser)
  .delete(verifyJWT, controllers.authController.logOut);

router.route("/current-user").get(verifyJWT, controllers.userController.getCurrentUser);

router
  .route("/reset-forgotten-password")
  .patch(verifyJWT, controllers.authController.resetForgottenPassword);

router
  .route("/upload-avatar")
  .post(verifyJWT, upload.single("avatar"), controllers.userController.updateUserAvatar);

module.exports = router;
