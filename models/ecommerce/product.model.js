const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const sizeSchema = new Schema({
  name: { type: String, required: true },
  inStock: { type: Boolean, required: true },
});

const ProductSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      require: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    imageSrc: {
      type: {
        url: String,
        public_id: String,
      },
      default: { url: null, public_id: null }, // Ensure the default is an object
    },
    subImgs: {
      type: [
        {
          url: String,
          public_id: String,
        },
      ],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    stock: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Schema.Types.ObjectId,
      ref: "Rating",
    },
    colors: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [sizeSchema],
      default: [],
    },
  },
  { timestamps: true }
);

ProductSchema.plugin(mongooseAggregatePaginate);

const ProductModel = model("Product", ProductSchema);

module.exports = ProductModel;
