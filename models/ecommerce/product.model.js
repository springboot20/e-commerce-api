const mongoose = require("mongoose");
const { Schema, model } = mongoose;

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
        localPath: String,
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    subImgs: {
      type: [
        {
          url: String,
          localPath: String,
        },
      ],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// ProductSchema.virtual('reviews', {
//   ref: 'Review',
//   localField: '_id',
//   foreignField: 'product',
//   justOne: false,
// });

// ProductSchema.pre('remove', async function (next) {
//   await this.model('Review').deleteMany({ product: this._id });
// });

const ProductModel = model("Product", ProductSchema);

module.exports = ProductModel;
