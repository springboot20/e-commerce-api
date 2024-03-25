const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    refresh_token: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    isAdmin: this.isAdmin,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

UserSchema.methods.generateRefreshToken = function () {
  const payload = {
    _id: this._id,
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};

const UserModel = model('User', UserSchema);
module.exports = UserModel;
