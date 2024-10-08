const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiResponse } = require("../../utils/api.response");
const { ApiError } = require("../../utils/api.error");
const { StatusCodes } = require("http-status-codes");
const model = require("../../models/index");
const { sendMail } = require("../../service/email.service");

const sendEmailVerification = asyncHandler(
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  async (req, res) => {
    const { email } = req.body;

    console.log(email);

    const user = await model.UserModel.findOne({ email });
    console.log(user);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "user does not exits", []);

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryTokens();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    
    await user.save({ validateBeforeSave: false });

    const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${
      user._id
    }/${unHashedToken}`;

    await sendMail(
      user?.email,
      "Email verification",
      { username: user?.username, verificationLink: verifyLink },
      "email",
    );

    return new ApiResponse(StatusCodes.OK, "email verificaton sent successfully", {});
  },
);

const emailVerification = asyncHandler(async (req, res) => {
  const { token, id } = req.params;

  if (!token) throw new ApiError(StatusCodes.UNAUTHORIZED, "verification token missing");

  const user = await model.UserModel.findOne({
    _id: id,
    emailVerificationTokenExpiry: { $gte: Date.now() },
  });

  if (!user)
    throw new ApiError(StatusCodes.UNAUTHORIZED, "unable to verify user, token invalid or expired");

  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  user.isEmailVerified = true;

  return new ApiResponse(StatusCodes.OK, "user email verified successfully", {
    isEmailVerified: true,
  });
});

const forgotPassword = asyncHandler(
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */

  async (req, res) => {
    const { email } = req.body;

    const user = await model.UserModel.findOne({ email });

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "user does not exists", []);
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryTokens();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    const resetLink = `${req.protocol}://${req.get("host")}/api/v1/reset-password/${unHashedToken}`;

    await sendMail(user.email, "Password reset", { resetLink, username: user.username }, "reset");

    return new ApiResponse(StatusCodes.OK, "password reset link sent successfully");
  },
);

const resendEmailVerification = asyncHandler(
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */

  async (req, res) => {
    const user = await model.UserModel.findById(req.user._id);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "user does not exists", []);
    }

    if (user.isEmailVerified) {
      throw new CustomErrors.Conflict(
        StatusCodes.CONFLICT,
        "user email has already been verified",
        [],
      );
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryTokens();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify-email/${unHashedToken}`;

    await sendMail(
      user?.email,
      "Email verification",
      { username: user?.username, verificationLink: verifyLink },
      "email",
    );

    await user.save({ validateBeforeSave: false });

    return new ApiResponse(StatusCodes.OK, "Email verification resend");
  },
);

module.exports = {
  sendEmailVerification,
  emailVerification,
  forgotPassword,
  resendEmailVerification,
};
