const model = require("../../../../models/index");
const { asyncHandler } = require("../../../../utils/asyncHandler");
const { ApiResponse } = require("../../../../utils/api.response");
const { ApiError } = require("../../../../utils/api.error");
const { StatusCodes } = require("http-status-codes");

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await model.CategoryModel.findByIdAndDelete(categoryId);
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, "category not found", []);

  await category.save();

  return new ApiResponse(StatusCodes.OK, "catergory deleted successfully");
});

module.exports = deleteeCategory