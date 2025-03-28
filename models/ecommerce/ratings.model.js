const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
  }
);

const RatingModel = mongoose.model("Rating", RatingSchema);

module.exports = RatingModel;
