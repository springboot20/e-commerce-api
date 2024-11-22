// const fetch = require("node-fetch");
const { PaymentMethods, OrderStatuses } = require("../../constants.js");
const { ApiError } = require("../../utils/api.error");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../utils/asyncHandler");
const { AddressModel, CartModel, OrderModel, ProductModel } = require("../../models");
const { getCart } = require("./cart.controller");
const { ApiResponse } = require("../../utils/api.response.js");

const {
  ApiError: PayPalApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController,
} = require("@paypal/paypal-server-sdk");

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});
const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);

const generatePaypalOrder = asyncHandler(async (req, res) => {
  const { addressId } = req.body;

  const userAddress = await AddressModel.findOne({
    _id: addressId,
    owner: req.user._id,
  });

  if (!userAddress) {
    throw new ApiError(StatusCodes.NOT_FOUND, "address not found", []);
  }

  const cart = await CartModel.findOne({ owner: req.user._id });

  if (!cart || !cart.items?.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "cart is empty", []);
  }

  const cartItems = cart.items;
  const userCart = await getCart(req.user._id);

  console.log(userCart);

  const totalPrice = userCart.totalCart;

  const paypalItems = {
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: (totalPrice / 1645).toFixed(0),
          },
        },
      ],
    },

    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } = await ordersController.ordersCreate(paypalItems);

    if (body?.id) {
      const order = OrderModel.create({
        customer: req.user._id,
        address: addressId,
        items: cartItems,
        orderPrice: totalPrice ?? 0,
        paymentMethod: PaymentMethods.PAYPAL,
        paymentId: body?.id,
      });

      if (order) {
        return ApiResponse(res, httpResponse.statusCode, "Paypal order created successfully", {
          order,
        });
      }
    }
  } catch (error) {
    if (error instanceof PayPalApiError) {
      const { statusCode, message } = error;
      throw new ApiError(statusCode, message, []);
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "error while creating paypal order", []);
  }
});

async function paypalOrderFulfillmentHelper(orderPaymentId, req) {
  const order = await OrderModel.findOneAndUpdate(
    { paymentId: orderPaymentId },
    {
      $set: {
        isPaymentDone: true,
      },
    },
    { new: true },
  );

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "order not found", []);
  }

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

  await ProductModel.bulkWrite(productBulkUpdate, { skipValidation: true });

  cart.items = [];

  await cart.save({ validateBeforeSave: false });
  return order;
}

const verifyPaypalOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const captureObj = {
    id: orderId,
    prefer: "return=minimal",
  };

  const { body, ...httpStatuscode } = await ordersController.ordersCapture(captureObj);

  const { statusCode } = httpStatuscode;

  if (body?.status === "COMPLETED") {
    const order = await paypalOrderFulfillmentHelper(body?.id, req);

    return new ApiResponse(statusCode, "order placed successfully", order);
  } else {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Something went wrong with paypal payment",
    );
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
  generatePaypalOrder,
  verifyPaypalOrder,
  updateOrderStatus,
};
