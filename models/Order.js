const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    userAddress: {
      type: Object,
      required: true,
    },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

const OrderModel = model('Order', OrderSchema);

module.exports = OrderModel;
