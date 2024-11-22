const mongoose = require('mongoose');
const { AvailableOrderStatusEnums, OrderStatuses, AvailablePaymentMethods, PaymentMethods } = require('../../constants');
const { Schema, model } = mongoose;

const OrderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
    },
    items: {
      type: [
        {
          quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity can not be less then 1.'],
            default: 1,
          },
          productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
          },
        },
      ],
      default: [],
    },
    orderStatus: {
      type: String,
      enum: AvailableOrderStatusEnums,
      default: OrderStatuses.PENDING,
    },
    isPaymentDone: {
      type: Boolean,
      default: false,
    },
    orderId: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: AvailablePaymentMethods,
      default: PaymentMethods.UNKNOWN,
    },
    orderPrice: {
      type: Number,
      required: true,
    },
    discountedOrderPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const OrderModel = model('Order', OrderSchema);

module.exports = OrderModel;
