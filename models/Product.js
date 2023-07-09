const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    price: {
      type: Number,
      require: [true, 'Please provide product price'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    imageSrc: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    categories: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['shirt', 'trouser', 'watch'],
    },
    size: {
      type: String,
      enum: ['md', 'lg', 'xl', 'xxl'],
      default: 'md',
    },
    color: {
      type: String,
      default: ['#222'],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const ProductModel = model('Product', ProductSchema);

module.exports = ProductModel;
