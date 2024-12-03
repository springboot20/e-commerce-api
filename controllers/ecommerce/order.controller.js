// const fetch = require("node-fetch");
const { PaymentMethods, OrderStatuses } = require("../../constants.js");
const { ApiError } = require("../../utils/api.error");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../utils/asyncHandler");
const { CartModel, OrderModel, ProductModel } = require("../../models");
const { getCart } = require("./cart.controller");
const { ApiResponse } = require("../../utils/api.response.js");
const axios = require("axios");
const crypto = require("crypto");
const flatted = require("flatted");

const generatePaystackOrder = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const cart = await CartModel.findOne({ owner: req.user._id });

  if (!cart || !cart.items?.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "cart is empty", []);
  }

  const cartItems = cart.items;
  const userCart = await getCart(req.user._id);
  const totalPrice = userCart.totalCart;

  try {
    let orderConfig = {
      email: email,
      amount: totalPrice * 100, // Paystack amount is in kobo
      metadata: {
        user_cart: cartItems,
      },
    };

    const payload = flatted.stringify(orderConfig);

    const response = await axios.post("https://api.paystack.co/transaction/initialize", payload, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const { data } = response;

    return new ApiResponse(res, StatusCodes.CREATED, data?.message, data);
  } catch (error) {
    console.error(error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", []);
  }
});

const orderFulfillmentHelper = asyncHandler(async (req, res) => {
  if (!req.body) {
    return false;
  }

  let isValidPaystackEvent = false;
  let signature = req.headers["x-paystack-signature"];

  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET)
      .update(flatted.stringify(req.body))
      .digest("hex");

    isValidPaystackEvent =
      hash && signature && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch (e) {
    console.error(e);
  }

  if (!isValidPaystackEvent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid signature", []);
  }

  let event = req.body;

  try {
    const cart = await CartModel.findOne({ owner: req.user._id });
    const userCart = await getCart(req.user._id);

    const productBulkUpdate = userCart.items.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.quantity } },
        },
      };
    });

    await OrderModel.create({
      customer: req.user._id,
      items: cart.items,
      orderPrice: event.data.amount ?? 0,
      paymentProvider: PaymentMethods.PAYSTACK,
      paymentId: event.data.reference,
      orderStatus: OrderStatuses.COMPLETED,
    });

    cart.items = [];
    await ProductModel.bulkWrite(productBulkUpdate, { skipValidation: true });
    await cart.save({ validateBeforeSave: false });

    return new ApiResponse(StatusCodes.OK, "order created successfully", {});
  } catch {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", []);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  let order = await OrderModel.findById(orderId);

  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "order not exist", []);

  if (order.status === OrderStatuses.COMPLETED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order already delivered");
  }

  order = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      $set: {
        status,
      },
    },
    { new: true },
  );

  return new ApiResponse(StatusCodes.OK, "order status changed successfully", { status });
});

module.exports = {
  generatePaystackOrder,
  orderFulfillmentHelper,
  updateOrderStatus,
};
