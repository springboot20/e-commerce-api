const mongoose = require("mongoose");
const {
  AvailableOrderStatusEnums,
  OrderStatuses,
  AvailablePaymentMethods,
  PaymentMethods,
} = require("../../constants");
const { Schema, model } = mongoose;
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const OrderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    items: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity can not be less then 1."],
            default: 1,
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
    paymentId: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: AvailablePaymentMethods,
      default: PaymentMethods.UNKNOWN,
    },
    orderPrice: {
      type: Number,
      default: 0.0,
      required: true,
    },
    discountedOrderPrice: {
      type: Number,
    },
    shipping_method: {
      type: String,
    },
  },
  { timestamps: true }
);

OrderSchema.plugin(mongooseAggregatePaginate);

const OrderModel = model("Order", OrderSchema);

module.exports = OrderModel;
