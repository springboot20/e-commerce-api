const model = require("../../models/index");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/api.error");
const { ApiResponse } = require("../../utils/api.response");
const { tokenResponse } = require("../../utils/jwt");
const { StatusCodes } = require("http-status-codes");
const { RoleEnums } = require("../../constants");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../../service/email.service");

const register = asyncHandler(
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async (req, res) => {
    const { username, email, role, phone_number } = req.body;

    console.log(req.body);

    const existedUser = await model.UserModel.findOne({ $or: [{ email }, { username }] });
    if (existedUser) throw new ApiError(StatusCodes.CONFLICT, "user already exists in database");

    const user = await model.UserModel.create({
      username,
      email,
      phone_number,
      role: role ?? RoleEnums.USER,
    });

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryTokens();

    console.log(unHashedToken);

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    // await sendMail(
    //   user?.email,
    //   "Email verification",
    //   { username: user?.username, verificationCode: unHashedToken },
    //   "email",
    // );

    console.log(user);

    await user.save({ validateBeforeSave: false });

    const createdUser = await model.UserModel.findById(user._id).select(
      "-password -emailVerificationToken -refreshToken",
    );

    if (!createdUser) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
    }

    return new ApiResponse(
      StatusCodes.OK,
      "User registration successfull and verification email has been sent to you email",
      {
        user: createdUser,
      },
    );
  },
);

const createPassword = asyncHandler(async (req, res) => {
  const { password, email } = req.body;

  const salt = await bcrypt.genSalt(10); // 10 is a reasonable salt rounds value

  const user = await model.UserModel.findOneAndUpdate(
    { email },
    {
      $set: {
        password: await bcrypt.hash(password, salt),
      },
    },
    { new: true },
  );

  const createdUser = await model.UserModel.findById(user._id).select(
    "-password -emailVerificationToken -emailVerificationExpiry -refreshToken",
  );

  return new ApiResponse(StatusCodes.OK, "User password created successfully", {
    user: createdUser,
  });
});

const login = asyncHandler(
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */

  async (req, res) => {
    const { username, email, password } = req.body;
    const user = await model.UserModel.findOne({ email });

    if (!email && !password) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Please provide email and password");
    }

    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        `No user found with this email: ${email} or username: ${username}`,
      );
    }

    console.log(user.password);

    if (!(await user.matchPasswords(password))) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid password, try again!!!");
    }

    const { access_token, refresh_token } = await tokenResponse(user._id);

    user.refresh_token = refresh_token;
    user.isAuthenticated = true;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await model.UserModel.findById(user._id).select(
      "-password -emailVerificationToken -emailVerificationExpiry -forgotPasswordExpiry -forgotPasswordToken",
    );

    if (!loggedInUser) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res
      .cookie("access_token", access_token, options)
      .cookie("refresh_token", refresh_token, options);

    console.log(req.user);

    return new ApiResponse(StatusCodes.OK, "user logged successfully", {
      user: loggedInUser,
      tokens: { access_token, refresh_token },
    });
  },
);

const logOut = asyncHandler(
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */

  async (req, res) => {
    await model.UserModel.findOneAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          refreshToken: undefined,
          isAuthenticated: false,
        },
      },
      { new: true },
    );
    return new ApiResponse(StatusCodes.OK, "user logged out", {});
  },
);

const resetForgottenPassword = asyncHandler(
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */

  async (req, res) => {
    const { password, token } = req.body;

    if (!token) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "verification token is not provided");
    }

    const user = await model.UserModel.findOne({
      _id: req.user._id,
      forgotPasswordExpiry: {
        $gte: Date.now(),
      },
    });

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "user does not exists", []);
    }

    const validToken = await bcrypt.compare(token, user.forgotPasswordToken);

    if (!validToken)
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid reset password token provided");

    const salt = await bcrypt.genSalt(10);

    const updatedUser = await model.UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: await bcrypt.hash(password, salt),
          forgotPasswordToken: undefined,
          forgotPasswordExpiry: undefined,
        },
      },
      { new: true },
    );

    return new ApiResponse(StatusCodes.OK, "forgotten password reset successfully", {
      user: updatedUser,
    });
  },
);

const assignRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const user = await model.UserModel.findById(userId);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  user.role = role;
  await user.save({ validateBeforeSave: false });

  return new ApiResponse(200, {}, "Role changed for the user");
});

module.exports = {
  register,
  login,
  logOut,
  createPassword,
  resetForgottenPassword,
  assignRole,
};
