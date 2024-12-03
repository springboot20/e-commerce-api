const model = require("../../../../models/index");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../../../utils/asyncHandler");
const { ApiResponse } = require("../../../../utils/api.response");
const { getMognogoosePagination } = require("../../../../helpers");

const getAllAddresses = asyncHandler(async (req, res) => {
  const { limit = 15, page = 1 } = req.query;

  const addressesAggregate = model.AddressModel.aggregate([
    {
      $match: {},
    },
  ]);

  const paginateAddresses = await model.AddressModel.aggregatePaginate(
    addressesAggregate,
    getMognogoosePagination({
      limit,
      page,
      customLabels: {
        totalDocs: "totalAddress",
        docs: "addresses",
      },
    }),
  );

  return new ApiResponse(StatusCodes.OK, "users addresses fetched successfully", {
    addresses: paginateAddresses,
  });
});

module.exports = getAllAddresses