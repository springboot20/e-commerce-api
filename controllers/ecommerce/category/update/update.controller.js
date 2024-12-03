const model = require("../../../../models/index");
const { asyncHandler } = require("../../../../utils/asyncHandler");
const { ApiResponse } = require("../../../../utils/api.response");
const { ApiError } = require("../../../../utils/api.error");
const { StatusCodes } = require("http-status-codes");

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  const category = await model.CategoryModel.findByIdAndUpdate(
    categoryId,
    {
      $set: {
        name,
      },
    },
    { new: true },
  );
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, "category not found", []);

  await category.save();

  return new ApiResponse(StatusCodes.OK, "catergory updated successfully", { category });
});

module.exports = updateCategory;
