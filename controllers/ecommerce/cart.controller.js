const { asyncHandler } = require("../../utils/asyncHandler.js");
const model = require("../../models/index");
const { default: mongoose } = require("mongoose");
const { ApiResponse } = require("../../utils/api.response.js");
const { StatusCodes } = require("http-status-codes");
const { ApiError } = require("../../utils/api.error.js");

const getCart = async (userId) => {
  const userCart = await model.CartModel.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $unwind: "$items",
    },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $project: {
        product: { $first: "$product" },
        quantity: "$items.quantity",
      },
    },
    {
      $group: {
        _id: "$_id",
        items: {
          $push: "$$ROOT",
        },
        totalCart: {
          $sum: {
            $multiply: ["$product.price", "$quantity"],
          },
        },
      },
    },
    {
      $addFields: {
        totalCart: "$totalCart",
      },
    },
  ]);

  return (
    userCart[0] ?? {
      _id: null,
      items: [],
      totalCart: 0,
    }
  );
};

const getUserCart = asyncHandler(async (req, res) => {
  const userCart = await getCart(req.user._id);

  return new ApiResponse(StatusCodes.OK, "user cart fetched successfully", { cart: userCart });
});

const addItemToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  const cart = await model.CartModel.findOne({
    owner: req.user._id,
  });

  const product = await model.ProductModel.findById(productId);
  console.log(product);

  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "product not found");

  if (quantity > product.stock) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `only ${product.stock} is remaining. But you are adding ${quantity}. Product out of stock`,
    );
  }

  const addedProduct = cart.items?.find((p) => p.productId.toString() === productId);

  if (addedProduct) {
    addedProduct.quantity = quantity;
  } else {
    cart.items.push({
      productId,
      quantity,
    });
  }

  await cart.save({ validateBeforeSave: true });

  const userCart = await getCart(req.user._id);

  return new ApiResponse(StatusCodes.OK, "item added to cart", { cart: userCart });
});

const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await model.ProductModel.findById(productId);

  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "product not found");

  const cart = await model.CartModel.findOneAndUpdate(
    { owner: req.user._id },
    {
      $pull: {
        items: {
          productId,
        },
      },
    },
    { new: true },
  );

  await cart.save({ validateBeforeSave: true });

  const userCart = await getCart(req.user._id);

  return new ApiResponse(StatusCodes.OK, "item removed from cart", { cart: userCart });
});

const clearCart = asyncHandler(async (req, res, next) => {
  await model.CartModel.findOneAndUpdate(
    { owner: req.user._id },
    {
      $set: {
        items: [],
      },
    },
    { new: true },
  );

  const userCart = await getCart(req.user._id);

  return new ApiResponse(StatusCodes.OK, "item added to cart", { cart: userCart });
});

module.exports = {
  getUserCart,
  addItemToCart,
  removeItemFromCart,
  clearCart,
  getCart,
};
