const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    user: {
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
      type: [String],
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
    company: {
      type: String,
      required: [true, 'Please provide company'],
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported',
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
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

const ProductModel = model('Product', ProductSchema);

module.exports = ProductModel;
