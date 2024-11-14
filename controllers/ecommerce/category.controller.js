const model = require('../../models/index');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiResponse } = require('../../utils/api.response');
const { ApiError } = require('../../utils/api.error');
const { StatusCodes } = require('http-status-codes');

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const existingCategory = await model.CategoryModel.findOne({ name });

  if (existingCategory) throw new ApiError(StatusCodes.CONFLICT, 'category already exist', []);

  const category = await model.CategoryModel.create({
    name,
    owner: req.user._id,
  });

  return new ApiResponse(StatusCodes.CREATED, 'user category created successfully', { category });
});

const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await model.CategoryModel.find({}).select('name _id');

  return new ApiResponse(StatusCodes.OK, 'catergories fetched successfully', { categories });
});

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
    { new: true }
  );
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'category not found', []);

  await category.save();

  return new ApiResponse(StatusCodes.OK, 'catergory updated successfully', { category });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await model.CategoryModel.findById(category);

  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'category not found', []);

  return new ApiResponse(StatusCodes.OK, 'catergories fetched successfully', { category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await model.CategoryModel.findByIdAndDelete(categoryId);
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, 'category not found', []);

  await category.save();

  return new ApiResponse(StatusCodes.OK, 'catergory deleted successfully');
});

module.exports = {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
