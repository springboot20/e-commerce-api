const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    rate: {
      type: Number,
      default: 0.0,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const RatingModel = mongoose.model("Rating", RatingSchema);

module.exports = RatingModel;
