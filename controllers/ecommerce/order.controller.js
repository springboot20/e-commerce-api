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
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email,
        amount: (totalPrice * 1700).toFixed(3), // Paystack amount is in kobo
        metadata: {
          user_cart: cartItems,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      },
    );

    const { data } = response;

    return new ApiResponse(res, StatusCodes.CREATED, data?.message, data);
  } catch (error) {
    console.error(error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", []);
  }
});

const orderFulfillmentHelper = asyncHandler(async (req, res) => {
  try {
    // Parse the request body as JSON
    const body = flatted.stringify(req.body);
    const jsonData = flatted.parse(body);

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET)
      .update(body, "utf-8")
      .digest("hex");

    if (hash == req.headers["x-paystack-signature"]) {
      const event = jsonData.event;

      if (event === "charge.success") {
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
          orderPrice: jsonData.data.requested_amount ?? 0,
          paymentProvider: PaymentMethods.PAYSTACK,
          paymentId: jsonData.data.reference,
        });

        cart.items = [];
        await ProductModel.bulkWrite(productBulkUpdate, { skipValidation: true });
        await cart.save({ validateBeforeSave: false });

        return new ApiResponse(StatusCodes.OK, "order created successfully", {});
      }
    } else {
      // Invalid signature, ignore the webhook event
      console.log("Invalid Paystack signature");
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid signature");
    }
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
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
