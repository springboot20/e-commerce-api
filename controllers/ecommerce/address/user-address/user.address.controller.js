const model = require("../../../../models/index");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../../../utils/asyncHandler");
const { ApiError } = require("../../../../utils/api.error");
const { ApiResponse } = require("../../../../utils/api.response");

const getUserAddress = asyncHandler(async (req, res) => {
  const address = await model.AddressModel.findOne({
    owner: req.user._id,
  });

  if (!address) throw new ApiError(StatusCodes.NOT_FOUND, "user address not found", []);

  return new ApiResponse(StatusCodes.OK, "user address fetched successfully", {
    address,
  });
});

const deleteUserAddress = asyncHandler(async (req, res) => {
  const deletedAddress = await model.AddressModel.findOneAndDelete({
    onwer: req.user?._id,
  });

  if (!deletedAddress) throw new ApiError(StatusCodes.NOT_FOUND, "user address does not exist");

  return new ApiResponse(StatusCodes.OK, "user address deleted successfully", {});
});

const updateAddress = asyncHandler(async (req, res) => {
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

  const address = await model.AddressModel.findOne({
    owner: req.user._id,
  });

  if (!address) throw new ApiError(StatusCodes.NOT_FOUND, "address does not exist");

  const updatedAddress = await model.AddressModel.findByIdAndUpdate(
    address._id,
    {
      $set: {
        city,
        country,
        address_line_one,
        address_line_two,
        zipcode,
        state,
        phone,
        firstname,
        lastname,
      },
    },
    { new: true },
  );

  return new ApiResponse(StatusCodes.OK, "user address updated successfully", {
    address: updatedAddress,
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const deletedAddress = await model.AddressModel.findOneAndDelete({
    _id: addressId,
  });

  if (!deletedAddress) throw new ApiError(StatusCodes.NOT_FOUND, "address does not exist");

  return new ApiResponse(StatusCodes.OK, "user address deleted successfully", {});
});

module.exports = { getUserAddress, deleteUserAddress, updateAddress, deleteAddress };
