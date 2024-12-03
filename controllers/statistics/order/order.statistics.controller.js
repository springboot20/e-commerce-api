const { StatusCodes } = require("http-status-codes");
const model = require("../../../models");
const { ApiResponse } = require("../../../utils/api.response");
const { asyncHandler } = require("../../../utils/asyncHandler");

const orderStats = [
  {
    $group: {
      _id: {
        week: {
          $week: "$createdAt",
        },
        year: {
          $year: "$createdAt",
        },
        month: {
          $month: "$createdAt",
        },
        status: "$orderStatus",
      },
      order_items: {
        $sum: "$items",
      },
      total_amount: {
        $sum: "$orderPrice",
      },
      count: { $sum: 1 },
    },
  },
  {
    $sort: {
      "_id.week": -1,
      "_id.month": -1,
      "_id.year": -1,
    },
  },
];

const orderStatistics = asyncHandler(
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   *
   */
  async (req, res) => {
    const statistics = await model.OrderModel.aggregate([
      {
        $match: {},
      },
      {
        $facet: {
          orderStats,
        },
      },
    ]);

    return new ApiResponse(StatusCodes.OK, "orders statistics fetched", { statistics });
  },
)

module.exports = { orderStatistics };
