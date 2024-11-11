// const fetch = require("node-fetch");
const { paypalBaseUrl, PaymentMethods, OrderStatuses } = require('../../constants.js');
const { ApiError } = require('../../utils/api.error');
const { StatusCodes } = require('http-status-codes');
const { asyncHandler } = require('../../utils/asyncHandler');
const { AddressModel, CartModel, OrderModel, ProductModel } = require('../../models');
const { getCart } = require('./cart.controller');
const { ApiResponse } = require('../../utils/api.response.js');

const {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController,
} = require('@paypal/paypal-server-sdk');

const generatePaypalAccessToken = async () => {
  try {
    const base64_endoded = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64');

    const response = await fetch(`${paypalBaseUrl.sandbox}/v1/oauth2/token`, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        response_type: 'id_token',
      }),
      headers: {
        Authorization: `Basic ${base64_endoded}`,
      },
    });

    const data = await response.json();

    return data?.access_token;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'error while generating paypal access token error'
    );
  }
};

/**
 *
 * @param {string} endpoint
 * @param {object} body
 */
async function paypalApi(endpoint, body = {}) {
  const accessToken = await generatePaypalAccessToken();
  return await fetch(`${paypalBaseUrl.sandbox}/v2/checkout/orders${endpoint}`, {
    method: 'POST', // or GET
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
}

const generatePaypalOrder = asyncHandler(async (req, res) => {
  const { addressId } = req.body;

  const userAddress = await AddressModel.findOne({
    _id: addressId,
    owner: req.user._id,
  });

  if (!userAddress) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'address not found', []);
  }

  const cart = await CartModel.findOne({ owner: req.user._id });

  if (!cart || !cart.items.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'cart is empty', []);
  }

  const cartItems = cart.items;
  const userCart = await getCart(req.user._id);

  const totalPrice = userCart.totalCart;

  const paypalItems = await paypalApi('/', {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: (totalPrice / 1645).toFixed(0),
        },
      },
    ],
  });

  const paypalItemsData = await paypalItems.json();

  if (paypalItemsData?.id) {
    const order = new OrderModel.create({
      customer: req.user._id,
      address: addressId,
      items: cartItems,
      orderPrice: totalPrice ?? 0,
      // discountedOrderPrice: totalPrice,
      paymentMethod: PaymentMethods.PAYPAL,
      paymentId: paypalItemsData.id,
    });

    if (order) {
      return ApiResponse(res, StatusCodes.CREATED, 'Paypal order created successfully', order);
    }
  }

  throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'error while creating paypal order', []);
});

async function paypalOrderFulfillmentHelper(orderPaymentId, req) {
  const order = await OrderModel.findOneAndUpdate(
    { _id: orderPaymentId },
    {
      $set: {
        isPaymentDone: true,
      },
    },
    { new: true }
  );

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'order not found', []);
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

const verifyPaypalyOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const response = await paypalApi(`/${orderId}/capture`);
  const data = await response.json();

  if (data?.status === 'COMPLETED') {
    const order = await paypalOrderFulfillmentHelper(data.id, req);

    return new ApiResponse(StatusCodes.OK, 'order placed successfully', order);
  } else {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong with paypal payment'
    );
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  let order = await OrderModel.findById(orderId);

  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'order not exist', []);

  if (order.status === OrderStatuses.COMPLETED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order already delivered');
  }

  order = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      $set: {
        status,
      },
    },
    { new: true }
  );

  return new ApiResponse(StatusCodes.OK, 'order status changed successfully', { status });
});

module.exports = {
  generatePaypalOrder,
  verifyPaypalyOrder,
  updateOrderStatus,
};
