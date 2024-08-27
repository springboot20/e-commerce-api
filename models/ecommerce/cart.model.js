const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const CartSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    items: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
          },
          quantity: {
            type: Number,
            default: 1,
          },
        },
      ],
      default: [],  
    },
  },
  { timestamps: true }
);

const CartModel = model('Cart', CartSchema);

module.exports = CartModel;
