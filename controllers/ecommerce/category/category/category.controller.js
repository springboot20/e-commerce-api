const model = require("../../../../models/index");
const { asyncHandler } = require("../../../../utils/asyncHandler");
const { ApiResponse } = require("../../../../utils/api.response");
const { ApiError } = require("../../../../utils/api.error");
const { StatusCodes } = require("http-status-codes");

const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await model.CategoryModel.findById(categoryId);

  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, "category not found", []);

  return new ApiResponse(StatusCodes.OK, "catergories fetched successfully", { category });
});

module.exports = getCategoryById;
