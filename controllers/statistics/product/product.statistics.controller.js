const { StatusCodes } = require("http-status-codes");
const model = require("../../../models");
const { ApiResponse } = require("../../../utils/api.response");
const { asyncHandler } = require("../../../utils/asyncHandler");

const getProductsStatistics = asyncHandler(async (req, res) => {
  const totalProducts = await model.ProductModel.countDocuments({});

  const products = await model.ProductModel.aggregate([
    {
      $match: {},
    },
    {
      $group: {
        _id: null,
        averagePrice: {
          $avg: "$price",
        },
      },
    },
  ]);

  const statistics = { totalProducts, averagePrice: products[0].averagePrice };

  console.log(statistics);

  return new ApiResponse(StatusCodes.OK, "Product statistics fetched successfully", { statistics });
});

module.exports = { getProductsStatistics };
