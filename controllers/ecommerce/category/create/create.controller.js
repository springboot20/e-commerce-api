const model = require("../../../../models/index");
const { asyncHandler } = require("../../../../utils/asyncHandler");
const { ApiResponse } = require("../../../../utils/api.response");
const { StatusCodes } = require("http-status-codes");

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const normalizedName = name.trim().toLowerCase();

  const existingCategory = await model.CategoryModel.findOne({ name: normalizedName });

  if (existingCategory) {
    return new ApiResponse(StatusCodes.OK, "Category already exists", { existingCategory });
  }

  const category = await model.CategoryModel.create({
    name: normalizedName,
    owner: req.user._id,
  });

  return new ApiResponse(StatusCodes.CREATED, "user category created successfully", { category });
});

module.exports = createCategory;
