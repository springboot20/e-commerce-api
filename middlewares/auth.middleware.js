const { validateToken } = require('../utils/jwt');
const model = require('../models/index');
const { cookiesResponse } = require('../utils/jwt');
const { ApiError } = require('../utils/api.error');
const { StatusCodes } = require('http-status-codes');

const verifyJWT = async (req, res, next) => {
  const token = req.cookies.access_token || req.headers?.authorization.replace('Bearer ', '');

  if (!token) throw new ApiError(StatusCodes.UNAUTHORIZED, 'token not provided');

  try {
    const decodedToken = validateToken(token);
    const user = await model.UserModel.findById(decodedToken._id);

    if (!user)
      throw new CustomErrors.UnAuthenticated(StatusCodes.UNAUTHORIZED, 'Invalid token provided');

    req.user = user;
  } catch (error) {
    next(error);
      throw new ApiError(StatusCodes.UNAUTHORIZED,  'Authentication Invalid' );
  }
};

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(StatusCodes.UNAUTHORIZED,  'Unauthorized to access this route' );
    }
    next();
  };
};

module.exports = {
  verifyJWT,
  authorizePermission,
};
