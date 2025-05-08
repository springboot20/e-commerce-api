const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0.0,
    },
    comment: {
      type: String,
      trim: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one rating per user per product
RatingSchema.index({ userId: 1, productId: 1 }, { unique: true });

const RatingModel = mongoose.model("Rating", RatingSchema);

module.exports = RatingModel;
