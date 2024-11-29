const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Enforce uniqueness at the database level
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const CategoryModel = mongoose.model("Category", CategorySchema);
module.exports = CategoryModel;
