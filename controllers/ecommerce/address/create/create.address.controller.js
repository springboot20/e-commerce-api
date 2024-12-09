const model = require("../../../../models/index");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../../../utils/asyncHandler");
const { ApiResponse } = require("../../../../utils/api.response");

const createAddress = asyncHandler(async (req, res) => {
  const {
    city,
    country,
    address_line_one,
    address_line_two,
    zipcode,
    state,
    phone,
    firstname,
    lastname,
    shipping_method,
  } = req.body;
  const owner = req.user._id;

  const newAddress = await model.AddressModel.create({
    owner,
    city,
    country,
    address_line_one,
    address_line_two,
    zipcode,
    state,
    phone,
    firstname,
    lastname,
    shipping_method,
  });

  return new ApiResponse(StatusCodes.CREATED, "user address added successfully", {
    address: newAddress,
  });
});

module.exports = createAddress;
