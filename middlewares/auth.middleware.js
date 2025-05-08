const { asyncHandler } = require("../utils/asyncHandler");
const { validateToken } = require("../utils/jwt");
const model = require("../models/index");
const { ApiError } = require("../utils/api.error");
const { StatusCodes } = require("http-status-codes");
const { AvailableRoles } = require("../constants");

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies.access_token || req.header("Authorization")?.replace("Bearer ", "");

  console.log(token);

  if (!token) throw new ApiError(StatusCodes.UNAUTHORIZED, "token not provided at verifyJWT");

  try {
    const decodedToken = validateToken(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await model.UserModel.findById(decodedToken._id);

    if (!user)
      throw new CustomErrors.UnAuthenticated(StatusCodes.UNAUTHORIZED, "Invalid token provided");

    req.user = user;
    next();
  } catch (error) {
    next(error);
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication Invalid");
  }
});

/**
 * @param {AvailableRoles} roles
 * @description
 * * This middleware is responsible for validating multiple user role permissions at a time.
 * * So, in future if we have a route which can be accessible by multiple roles, we can achieve that with this middleware
 */
const checkPermissions = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized request");
    }
    if (roles.includes(req.user?.role)) {
      next();
    } else if (!roles.includes(req?.user.role)) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "UnAuthenticated to access this route");
    }
  });
};

module.exports = {
  verifyJWT,
  checkPermissions,
};
