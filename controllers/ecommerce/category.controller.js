const model = require("../../models/index");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiResponse } = require("../../utils/api.response");
const { ApiError } = require("../../utils/api.error");
const { StatusCodes } = require("http-status-codes");

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const existingCategory = await model.CategoryModel.findOne({ name });

  if (existingCategory) throw new ApiError(StatusCodes.CONFLICT, "category already exist", []);

  const category = await model.CategoryModel.create({
    name,
    owner: req.user._id,
  });

  return new ApiResponse(StatusCodes.CREATED, "user category created successfully", { category });
});

const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await model.CategoryModel.find({}).select("name _id");

  return new ApiResponse(StatusCodes.OK, "catergories fetched successfully", { categories });
});

const updateCategory = asyncHandler(async (req, res) => {});

const getCategoryById = asyncHandler(async (req, res) => {});

const deleteCategory = asyncHandler(async (req, res) => {});

module.exports = {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
