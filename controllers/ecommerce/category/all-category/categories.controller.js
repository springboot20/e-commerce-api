const model = require("../../../../models/index");
const { asyncHandler } = require("../../../../utils/asyncHandler");
const { ApiResponse } = require("../../../../utils/api.response");
const { ApiError } = require("../../../../utils/api.error");
const { StatusCodes } = require("http-status-codes");


const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await model.CategoryModel.find({}).select("name _id");

  return new ApiResponse(StatusCodes.OK, "catergories fetched successfully", { categories });
});

module.exports = getAllCategory