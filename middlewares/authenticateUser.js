const customErrors = require('../errors/customError');
const { validateToken } = require('../utils/jwt');
const model = require('../models/index');
const { cookiesResponse } = require('../utils/jwt');

const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = validateToken(accessToken);
      console.log(payload);
      req.user = payload.user;
      return next();
    }
    const payload = validateToken(refreshToken);
    console.log(payload);

    const existingToken = await model.TokenModel.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new customErrors.UnAuthenticated('Authentication Invalid');
    }

    cookiesResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });

    req.user = payload.user;
    next();
  } catch (error) {
    throw new customErrors.UnAuthenticated('Authentication Invalid');
  }
};

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new customErrors.UnAuthorized('Unauthorized to access this route');
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermission,
};
