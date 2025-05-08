const model = require("../../../models/index");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../../utils/asyncHandler");
const { ApiError } = require("../../../utils/api.error");
const { ApiResponse } = require("../../../utils/api.response");
const { getMognogoosePagination } = require("../../../helpers");
const { emitSocketEventToUser } = require("../../../socket/socket.config");
const {
  PRODUCT_RATING_WITHOUT_COMMENT,
  PRODUCT_RATING_WITH_COMMENT,
} = require("../../../enums/socket-events");
const { default: mongoose } = require("mongoose");

const rateProductWithComment = asyncHandler(async (req) => {
  const { productId, rating, comment } = req.body;

  const product = await model.ProductModel.findById(new mongoose.Types.ObjectId(productId));

  if (!product)
    throw new ApiError(StatusCodes.NOT_FOUND, `product with Id: ${productId} not exist`);

  const ratings = await model.RatingModel.create({
    rate: rating,
    productId: product?._id,
    comment,
  });

  const updatedProduct = await model.ProductModel.findByIdAndUpdate(
    product?._id,
    {
      $set: {
        rating: rating?._id,
      },
    },
    { new: true }
  );

  await updatedProduct.save();

  return new ApiResponse(StatusCodes.OK, "rated product", ratings);
});

const rateProductWithoutComment = asyncHandler(async (req, res) => {
  const { productId, rating } = req.body;

  const product = await model.ProductModel.findById(new mongoose.Types.ObjectId(productId));

  if (!product)
    throw new ApiError(StatusCodes.NOT_FOUND, `product with Id: ${productId} not exist`);

  const ratings = await model.RatingModel.create({
    rate: rating,
    productId: product?._id,
  });

  const updatedProduct = await model.ProductModel.findByIdAndUpdate(
    product?._id,
    {
      $set: {
        rating: rating?._id,
      },
    },
    { new: true }
  );

  await updatedProduct.save();

  return new ApiResponse(StatusCodes.OK, "rated product", ratings);
});

module.exports = { rateProductWithComment, rateProductWithoutComment };
