const model = require('../models');
const transactions = require('../middlewares/mongooseTransaction');
const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, isAdmin) => {
  return jwt.sign({ userId, isAdmin }, process.env.ACCESS_TOKEN_SECRETE, { expiresIn: '1h' });
};

const newUser = transactions(async (req, res, session) => {
  const { email, ...rest } = req.body;
  try {
    const userExist = await model.UserModel.findOne({ email });
    if (userExist) throw new Error('User already exists');

    const userDocument = new model.UserModel({ ...rest, email });
    await userDocument.save({ session });

    const accessToken = generateAccessToken(userDocument._id, userDocument.isAdmin);
    const { password, ...others } = userDocument._doc;

    res.status(201).json({
      ...others,
      id: userDocument._id,
      accessToken: accessToken,
    });
  } catch (error) {
    console.log(error);
  }
});

const login = transactions(async (req, res, session) => {
  const userExist = await model.UserModel.findOne({ email: req.body.email });

  if (!userExist) res.status(409).json({ message: 'User does not exists' });
  if (await userExist.comparePassword(req.body.password)) res.status(409).json({ message: 'Invalid password' });

  const accessToken = generateAccessToken(userExist._id, userExist.isAdmin);
  const { password, ...others } = userExist._doc;

  res.status(201).json({ ...others, id: userExist._id, accessToken: accessToken });
});

module.exports = {
  newUser,
  login,
};
