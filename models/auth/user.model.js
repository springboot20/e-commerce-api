const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { RoleEnums, AvailableRoles } = require("../../constants");

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
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
      enum: AvailableRoles,
      default: RoleEnums.USER,
    },
    refresh_token: {
      type: String,
    },
    isEmailVerified: { type: Boolean, default: false },
    forgotPasswordToken: { type: String },
    forgotPasswordTokenExpiry: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationTokenExpiry: { type: Date },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPasswords = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    isAdmin: this.isAdmin,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
  });
};

userSchema.methods.generateRefreshToken = function () {
  const payload = {
    _id: this._id,
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
  });
};

userSchema.methods.generateTemporaryTokens = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // Generate salt and hash the token synchronously
  const salt = bcrypt.genSaltSync(10); // Use synchronous version for hashing
  const hashedToken = bcrypt.hashSync(unHashedToken, salt);

  const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes from now

  return { unHashedToken, hashedToken, tokenExpiry };
};

const UserModel = model("User", userSchema);
module.exports = UserModel;
