const jwt = require('jsonwebtoken');
const { ApiError } = require('./api.error');
const model = require('../models/index');

function validateToken(token, secret) {
  try {
    const decodedToken = jwt.verify(token, secret);
    return decodedToken;
  } catch (error) {
    throw new ApiError(401, 'Token verification failed', []);
  }
}

const tokenResponse = async (userId) => {
  try {
    const user = await model.UserModel.findById(userId);

    const access_token = user.generateAccessToken();
    const refresh_token = user.generateRefreshToken();

    user.refresh_token = refresh_token;

    await user.save({ validateBeforeSave: false });

    return { access_token, refresh_token };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  validateToken,
  tokenResponse,
};
