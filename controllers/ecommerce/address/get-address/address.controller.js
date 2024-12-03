const model = require("../../../../models/index");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../../../utils/asyncHandler");
const { ApiError } = require("../../../../utils/api.error");
const { ApiResponse } = require("../../../../utils/api.response");

const getAddressById = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await model.AddressModel.findById(addressId);

  if (!address) throw new ApiError(StatusCodes.NOT_FOUND, "address does not exist", []);

  return new ApiResponse(StatusCodes.OK, "user address fetched successfully", {
    address,
  });
});

module.exports = getAddressById