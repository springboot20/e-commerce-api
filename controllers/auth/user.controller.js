const model = require("../../models/index");
const { asyncHandler } = require("../../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const { ApiError } = require("../../utils/api.error");
const { ApiResponse } = require("../../utils/api.response");
const { getMognogoosePagination } = require("../../helpers");
const {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} = require("../../configs/cloudinary.config");

const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const userAggregate = model.UserModel.aggregate([
    {
      $match: {},
    },
  ]);

  const paginatedUsers = await model.UserModel.aggregatePaginate(
    userAggregate,
    getMognogoosePagination({
      limit,
      page,
      customLabels: {
        totalDocs: "total_users",
        docs: "users",
      },
    }),
  );

  return new ApiResponse(StatusCodes.OK, "users fetched successfully", paginatedUsers);
});

const getVerifiedUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const verifiedUsersAggregate = model.UserModel.aggregate([
    {
      $match: {
        isEmailVerified: true,
      },
    },
    {
      $project: {
        username: 1,
        avatar: 1,
        email: 1,
        role: 1,
      },
    },
  ]);

  const paginatedVerifiedUsers = await model.UserModel.aggregatePaginate(
    verifiedUsersAggregate,
    getMognogoosePagination({
      limit,
      page,
      customLabels: {
        totalDocs: "total_verified_users",
        docs: "verified_users",
      },
    }),
  );

  return new ApiResponse(
    StatusCodes.OK,
    "verified user fetched succefully",
    paginatedVerifiedUsers,
  );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await model.UserModel.findById(req?.user?._id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Unable to find user");
  }

  return new ApiResponse(StatusCodes.OK, "current user fetched", {
    user,
  });
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const user = await model.UserModel.findById(req?.user?._id);

  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "user not found", []);

  if (!req.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "user avatar image is required");
  }

  let uploadImage;

  if (req.file) {
    if (user?.avatar?.public_id !== null) {
      await deleteFileFromCloudinary(user?.avatar?.public_id);
    }
    uploadImage = await uploadFileToCloudinary(
      req.file.buffer,
      `${process.env.CLOUDINARY_BASE_FOLDER}/users-image`,
    );
  }

  const userAvatarUpdate = await model.UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: {
          url: uploadImage?.secure_url,
          public_id: uploadImage?.public_id,
        },
      },
    },
    { new: true },
  );
  return new ApiResponse(StatusCodes.OK, "users fetched successfully", { user: userAvatarUpdate });
});

const updateUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await model.UserModel.findById(req.user?._id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Unable to find user");
  }

  const updatedUser = await model.UserModel.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username,
        email,
        password,
      },
    },
    { new: true },
  );

  await updatedUser.save({ validateBeforeSave: false });

  return new ApiResponse(StatusCodes.OK, "User updated successfully", { user: updatedUser });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await model.UserModel.findById(userId);

  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "user not found", []);

  if (user?.avatar?.public_id !== null) await deleteFileFromCloudinary(user?.avatar?.public_id);
  await model.UserModel.findByIdAndDelete(userId);

  return new ApiResponse(StatusCodes.OK, "user deleted successfully", {});
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await model.UserModel.findById(req.user?._id);

  // check the old password
  const isPasswordValid = await user.matchPasswords(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid old password");
  }

  // assign new password in plain text
  // We have a pre save method attached to user schema which automatically hashes the password whenever added/modified
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return new ApiResponse(StatusCodes.OK, "Password changed successfully", {});
});

module.exports = {
  getCurrentUser,
  getUsers,
  updateUser,
  deleteUser,
  updateUserAvatar,
  getVerifiedUsers,
  changeCurrentPassword,
};
