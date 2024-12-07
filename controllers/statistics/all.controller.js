const { StatusCodes } = require("http-status-codes");
const model = require("../../models");
const { ApiResponse } = require("../../utils/api.response");
const { asyncHandler } = require("../../utils/asyncHandler");

const getAllStatistics = asyncHandler(async (req, res) => {
  // Fetch total number of products
  const totalProducts = await model.ProductModel.countDocuments();

  // Fetch average price of products
  const averagePrice = await model.ProductModel.aggregate([
    { $group: { _id: null, avgPrice: { $avg: "$price" } } },
  ]);

  // Fetch total sales
  const totalSales = await model.OrderModel.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$orderPrice" } } },
  ]);

  // Fetch total number of orders
  const totalOrders = await model.OrderModel.countDocuments();

  // Fetch total number of users
  const customers = await model.UserModel.countDocuments({});

  const statistics = {
    totalProducts,
    product: {
      averagePrice: averagePrice[0].avgPrice,
      totalSales: totalSales[0].totalSales,
    },
    totalOrders,
    customers,
  };

  return new ApiResponse(StatusCodes.OK, "Product statistics fetched successfully", { statistics });
});

module.exports = { getAllStatistics };
