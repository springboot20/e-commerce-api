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
  } = req.body;
  const owner = req.user._id;

  const existingAddress = await model.AddressModel.findOne({ owner: req.user._id });

  if (existingAddress) {
    await model.AddressModel.findByIdAndDelete(existingAddress?._id);
    await model.OrderModel.findOneAndDelete({ address: existingAddress?._id });
  }

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
  });

  await model.OrderModel.create({
    owner,
    address: newAddress._id,
  });

  return new ApiResponse(StatusCodes.CREATED, "user address added successfully", {
    address: newAddress,
  });
});

module.exports = createAddress;
