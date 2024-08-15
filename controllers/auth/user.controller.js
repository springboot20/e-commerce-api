const model = require("../../models/index");
const { asyncHandler } = require("../../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");
const { ApiError } = require("../../utils/api.error");
const { ApiResponse } = require("../../utils/api.response");
const { getFileLocalPath, getFileStaticPath } = require("../../helpers");

const getUsers = asyncHandler(async (req, res) => {
  const users = await model.UserModel.find({});
  console.log(users);

  return new ApiResponse(StatusCodes.OK, "users fetched successfully", { users });
});

const getVerifiedUsers = asyncHandler(async (req, res) => {
  const verifiedUsers = await model.UserModel.aggregate([
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

  return new ApiResponse(StatusCodes.OK, "verified user fetched succefully", { verifiedUsers });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log(req.user);
  return new ApiResponse(StatusCodes.OK, "current user fetched", {
    user: req.user,
  });
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "No file uploaded", []);
  }

  const imageUrl = getFileStaticPath(req, req.file?.filename);
  const imageLocalPath = getFileLocalPath(req.file?.filename);

  console.log(imageUrl, imageLocalPath, req.file);

  const userAvatarUpdate = await model.UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: {
          url: imageUrl,
          localPath: imageLocalPath,
        },
      },
    },
    { new: true },
  );

  return new ApiResponse(StatusCodes.OK, "users fetched successfully", { user: userAvatarUpdate });
});

const updateUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await UserModel.findById(req.user._id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Unable to find user");
  }

  const updatedUser = await model.UserModel.findByIdAndUpdate(
    user._id,
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

const deleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const deletedUser = await model.UserModel.findByIdAndDelete(
    new mongoose.Types.ObjectId(userId),
    {
      $set: {
        username,
        email,
        password,
      },
    },
    { new: true },
  );

  await deletedUser.save({ validateBeforeSave: false });

  return new ApiResponse(StatusCodes.OK, "User deleted successfully", {});
});

module.exports = {
  getCurrentUser,
  getUsers,
  updateUser,
  deleteUser,
  updateUserAvatar,
  getVerifiedUsers,
};
