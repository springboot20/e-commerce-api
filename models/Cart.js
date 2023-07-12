const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const CartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        productId: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

const CartModel = model('Cart', CartSchema);

module.exports = CartModel;
