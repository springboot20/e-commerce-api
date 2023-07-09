const model = require('../models');
const transactions = require('../middlewares/mongooseTransaction');
const { cookiesResponse } = require('../utils/jwt');
const customErrors = require('../errors/customError');
const createTokenUser = require('../utils/createTokenUser');
const { StatusCodes } = require('http-status-codes');
const crypto = require('crypto');

const newUser = transactions(async (req, res, session) => {
  const { email, ...rest } = req.body;
  try {
    const userExist = await model.UserModel.findOne({ email });
    if (userExist) throw new customErrors.BadRequest('User already exists');

    const isFirstAccount = (await model.UserModel.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const userDocument = new model.UserModel({ ...rest, email, role });
    await userDocument.save({ session });

    res.status(201).json({ message: 'You have successfully created an account' });
  } catch (error) {
    console.log(error);
  }
});

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new customErrors.BadRequest('Please provide email and password');

  const user = await model.UserModel.findOne({ email });

  if (!user) {
    throw new customErrors.UnAuthenticated('Invalid Credentials');
  }

  if (!(await user.matchPassword(password))) {
    throw new customErrors.UnAuthenticated('Invalid credentials');
  }

  const tokenUser = createTokenUser(user);

  // create refresh token
  let refreshToken = '';
  // check for existing token
  const existingToken = await model.TokenModel.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;

    if (!isValid) {
      throw new customErrors.UnAuthenticated('Invalid Credentials');
    }

    refreshToken = existingToken.refreshToken;

    cookiesResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await model.TokenModel.create(userToken);
  cookiesResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

module.exports = {
  newUser,
  login,
};
