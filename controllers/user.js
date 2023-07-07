const model = require('../models/index');
const transactions = require('../middlewares/mongooseTransaction');
const bcrypt = require('bcryptjs');

async function hashPassword(enteredPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(enteredPassword, salt);
}

const getUser = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  try {
    const userDoc = await model.UserModel.findById(id);
    const { password, ...rest } = userDoc._doc;
    res.status(201).json({ ...rest });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getUsers = async (req, res, next) => {
  const query = req.query.new;
  try {
    const usersDoc = query ? await model.UserModel.find().sort('createdAt').limit(5) : await model.UserModel.find();
    res.status(201).json(usersDoc);
  } catch (error) {
    res.status(500).json(error);
  }
};

const usersStats = async (req, res, next) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const userStats = await model.UserModel.aggregate([{ $match: { createdAt: { $gte: lastYear } } }, { $project: { $month: '$createdAt' } }, { $group: { _id: '$month', total: { $sum: 1 } } }]);

    res.status(201).json(userStats);
  } catch (error) {}
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
  usersStats,
  updateUser,
  deleteUser,
};
