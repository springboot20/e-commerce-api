const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, require: true },
    description: { type: String, required: true },
    imageSrc: { type: String, required: true },
    categories: { type: Array },
    size: { type: String },
    color: { type: String },
  },
  { timestamps: true }
);

const ProductModel = model('Product', ProductSchema);

module.exports = ProductModel;
