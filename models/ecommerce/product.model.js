const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

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
      default: {
        url: null,
        public_id: null,
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
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

ProductSchema.plugin(mongooseAggregatePaginate);

const ProductModel = model("Product", ProductSchema);

module.exports = ProductModel;
