const mongoose = require('mongoose');
// const cryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserModel = model('User', UserSchema);

// UserSchema.pre('save', function (next) {
//   if (!this.isModified('password')) {
//     next();
//   }

//   const hashedPassword = cryptoJS.AES.encrypt(this.password, process.env.CRYPTOJS_SECERET).toString();
//   this.password = hashedPassword;
// });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('pasword')) {
    next();
  }

  const salt = bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = UserModel;
