const createCategory = require("./create/create.controller");
const updateCategory = require("./update/update.controller");
const deleteCategory = require("./delete/delete.controller");
const getAllCategory = require("./all-category/categories.controller");
const getCategoryById = require("./category/category.controller");

module.exports = {
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategory
};
