const model = require('../../models/index');
const { StatusCodes } = require('http-status-codes');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../utils/api.error');
const { ApiResponse } = require('../../utils/api.response');
const { getMognogoosePagination } = require('../../helpers');

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

  return new ApiResponse(StatusCodes.CREATED, 'user address added successfully', {
    address: newAddress,
  });
});

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
        totalDocs: 'totalAddress',
        docs: 'addresses',
      },
    })
  );

  return new ApiResponse(StatusCodes.OK, 'users addresses fetched successfully', {
    addresses: paginateAddresses,
  });
});

const getAddressById = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = await model.AddressModel.findById(addressId);

  if (!address) throw new ApiError(StatusCodes.NOT_FOUND, 'address does not exist');

  return new ApiResponse(StatusCodes.OK, 'user address fetched successfully', {
    address: address,
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
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
    _id: addressId,
    owner: req.user._id,
  });

  if (!address) throw new ApiError(StatusCodes.NOT_FOUND, 'address does not exist');

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
    { new: true }
  );

  return new ApiResponse(StatusCodes.OK, 'user address updated successfully', {
    address: updatedAddress,
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const deletedAddress = await model.AddressModel.findOneAndDelete({
    _id: addressId,
    owner: req.user._id,
  });

  if (!deletedAddress) throw new ApiError(StatusCodes.NOT_FOUND, 'address does not exist');

  return new ApiResponse(StatusCodes.OK, 'user address deleted successfully', {});
});

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
