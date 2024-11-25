const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { RoleEnums, AvailableRoles } = require("../../constants");
const CartModel = require("../ecommerce/cart.model");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const AddressModel = require("../ecommerce/address.model");

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
    isAuthenticated: {
      type: Boolean,
      default: false,
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
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10); // 10 is a reasonable salt rounds value

    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error); // Pass error to next middleware
  }
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

userSchema.post("save", async function (user, next) {
  const userCart = await CartModel.findOne({ bookedBy: user._id });

  if (!userCart) {
    await CartModel.create({
      owner: user._id,
      items: [],
    });
  }

  next();
});

userSchema.plugin(mongooseAggregatePaginate);

const UserModel = model("User", userSchema);
module.exports = UserModel;
