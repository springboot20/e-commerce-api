const model = require('../models/index');
const transactions = require('../middlewares/mongooseTransaction');
const { StatusCodes } = require('http-status-codes');
const customErrors = require('../errors/customError');
// const { createTokenUser, cookieResponse } = require('../utils/jwt');
const checkPermission = require('../utils/checkPermission');

async function hashPassword(enteredPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(enteredPassword, salt);
}

const getUsers = async (req, res) => {
  console.log(req.user);
  const users = await model.UserModel.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getUser = async (req, res) => {
  console.log(req.user); // Log req.user to check its value
  try {
    let user = await model.UserModel.findOne({ _id: req.params.id }).select('-password');

    if (user && user._id) {
      checkPermission(req.user, user._id);
    }

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    console.log(error);
  }
};

const updateUser = transactions(async (req, res, session) => {
  const {
    params: { id },
  } = req;

  if (req.body.password) {
    req.body.password = await hashPassword(req.body.password);
  }

  try {
    const updatedUserDocument = await model.UserModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    await updatedUserDocument.save({ session });

    res.status(201).json(updatedUserDocument);
  } catch (error) {
    res.status(500).json(error);
  }
});

const deleteUser = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  try {
    await model.UserModel.findByIdAndDelete(id);
    res.status(201).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
};
