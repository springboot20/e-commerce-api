const { PaymentMethods, OrderStatuses, paystackStatus } = require("../../constants.js");
const { ApiError } = require("../../utils/api.error");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../utils/asyncHandler");
const { CartModel, OrderModel, ProductModel, UserModel, AddressModel } = require("../../models");
const { getCart } = require("./cart.controller");
const { ApiResponse } = require("../../utils/api.response.js");
const axios = require("axios");
const { removeCircularReferences } = require("../../helpers.js");

async function initializePaystackPayment({ email, amount }) {
  try {
    let orderConfig = {
      email: email,
      amount: amount * 100, // Paystack amount is in kobo
      callback_url: `${process.env.PAYSTACK_CALLBACK_URL}`,
    };

    const payload = JSON.stringify(orderConfig);

    const response = await axios.post("https://api.paystack.co/transaction/initialize", payload, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const { data } = response;
    if (data && data.status) {
      return data;
    }
    return null;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while generating paystack authorization url",
      [],
    );
  }
}

async function verifyPaystackPaymentHelper(reference) {
  try {
    let response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const { data } = response;
    console.log(data);

    return data;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "something went wrong");
  }
}

const generatePaystackOrder = asyncHandler(async (req, res) => {
  const { addressId } = req.body;

  const address = await AddressModel.findById(addressId);

  if (!address) throw new ApiError(StatusCodes.NOT_FOUND, "address does not exists");

  const cart = await CartModel.findOne({ owner: req.user._id });
  const user = await UserModel.findById(req.user._id);

  if (!cart || !cart.items?.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "cart is empty", []);
  }

  const cartItems = cart.items;
  const userCart = await getCart(req.user._id);
  const totalPrice = userCart?.totalCart;

  const response = await initializePaystackPayment({
    email: user?.email,
    amount: totalPrice,
    cartItems,
  });

  let order = undefined;

  if (response.status === true) {
    order = await OrderModel.create({
      customer: req.user?._id,
      address: address?._id,
      paymentId: response.data?.reference,
      items: cartItems,
      orderStatus: OrderStatuses.PENDING,
      paymentMethod: PaymentMethods.PAYSTACK,
      orderPrice: totalPrice,
    });
  }

  if (!order) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "error while placing order");

  const responseData = removeCircularReferences(
    new ApiResponse(StatusCodes.CREATED, response?.message, {
      order,
      url: response.data?.authorization_url,
    }),
  );

  return responseData;
});

const orderFulfillmentHelper = asyncHandler(async (req, res) => {
  const { reference } = req.query;
  const order = await OrderModel.findOne({ paymentId: reference });

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "no order found");
  }

  if (order.orderStatus === OrderStatuses.COMPLETED) {
    throw new ApiResponse(StatusCodes.CONFLICT, "order has already been verified", { order });
  }

  const orderReference = order.paymentId;

  const response = await verifyPaystackPaymentHelper(orderReference);
  if (!response) return null;

  const orderStatus = response?.data?.status;
  const orderConfirmed = orderStatus === paystackStatus.success;

  const cart = await CartModel.findOne({ owner: req.user._id });
  const userCart = await getCart(req.user._id);

  let productBulkUpdate;

  if (orderConfirmed) {
    productBulkUpdate = userCart.items.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.quantity } },
        },
      };
    });

    order.orderStatus = OrderStatuses.COMPLETED;
    order.isPaymentDone = true;
  }

  cart.items = [];
  await ProductModel.bulkWrite(productBulkUpdate, { skipValidation: true });
  await cart.save({ validateBeforeSave: false });
  await order.save({ validateBeforeSave: false });

  const responseData = removeCircularReferences(
    new ApiResponse(StatusCodes.OK, "order created successfully", {}),
  );

  return responseData;
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
