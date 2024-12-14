const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiResponse } = require("../../utils/api.response");
const { ApiError } = require("../../utils/api.error");
const { StatusCodes } = require("http-status-codes");
const model = require("../../models/index");
const { sendMail } = require("../../service/email.service");
const bcrypt = require("bcryptjs");

const emailVerification = asyncHandler(
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns
   */

  async (req, res) => {
    const { token } = req.body;

    if (!token) throw new ApiError(StatusCodes.UNAUTHORIZED, "verification token missing");

    const user = await model.UserModel.findOne({
      _id: id,
      emailVerificationTokenExpiry: { $gte: Date.now() },
    });

    if (!user)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "unable to verify user, token invalid or expired",
      );

    const validToken = await bcrypt.compare(token, user?.emailVerificationToken);

    if (!validToken) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email token provided");

    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    user.isEmailVerified = true;

    await user.save({ validateBeforeSave: false });

    return new ApiResponse(StatusCodes.OK, "user email verified successfully", {
      isEmailVerified: true,
    });
  },
);

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

    await user.save({ validateBeforeSave: false });

    await sendMail(
      user.email,
      "Password reset",
      { resetCode: unHashedToken, username: user?.username },
      "reset",
    );

    return new ApiResponse(StatusCodes.OK, "password reset link sent successfully");
  },
);

const resendEmailVerification = asyncHandler(
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */

  async (req, res) => {
    const user = await model.UserModel.findOne({
      $or: [{ email: req.body.email }, { _id: req.user._id }],
    });

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

    await user.save({ validateBeforeSave: false });

    await sendMail(
      user?.email,
      "Email verification",
      { username: user?.username, verificationCode: unHashedToken },
      "email",
    );

    await user.save({ validateBeforeSave: false });

    return new ApiResponse(StatusCodes.OK, "Email verification resend");
  },
);

module.exports = {
  emailVerification,
  forgotPassword,
  resendEmailVerification,
};
