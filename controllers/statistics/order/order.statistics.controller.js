const { StatusCodes } = require("http-status-codes");
const model = require("../../../models");
const { ApiResponse } = require("../../../utils/api.response");
const { asyncHandler } = require("../../../utils/asyncHandler");

let weeklyOrders = [
  {
    $group: {
      _id: {
        week: {
          $week: "$createdAt",
        },
        year: {
          $year: "$createdAt",
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
      "_id.year": -1,
      "_id.week": -1,
    },
  },
];

let monthlyOrders = [
  {
    $group: {
      _id: {
        month: {
          $month: "$createdAt",
        },
        year: {
          $year: "$createdAt",
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
      "_id.year": -1,
      "_id.month": -1,
    },
  },
];

let yearlyOrders = [
  {
    $group: {
      _id: {
        year: {
          $year: "$createdAt",
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
      "_id.year": -1,
    },
  },
];

const getOrderStatistics = asyncHandler(
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
          weekly: weeklyOrders,
          monthly: monthlyOrders,
          yearly: yearlyOrders,
        },
      },
    ]);

    return new ApiResponse(StatusCodes.OK, "orders statistics fetched", { statistics });
  },
);

module.exports = { getOrderStatistics };
