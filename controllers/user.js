const model = require('../models/index');
const transactions = require('../middlewares/mongooseTransaction');
const bcrypt = require('bcryptjs');

async function hashPassword(enteredPassword) {
  return await bcrypt.hash(enteredPassword, bcrypt.genSalt(10));
}

const updateUser = transactions(async (req, res, session) => {
  const {
    params: { id },
  } = req;

  if (req.body.password) {
    const hashedPassword = await hashPassword(password);
    req.body.password = hashedPassword;
  }

  try {
    const newUserDocument = await model.UserModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });

    await newUserDocument.save({ session });
    res.status(201).json(newUserDocument);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = {
  updateUser,
};
