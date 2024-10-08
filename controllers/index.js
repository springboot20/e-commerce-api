const authController = require("./auth/auth.controller");
const userController = require("./auth/user.controller");
const productController = require("./ecommerce/product.controller");
const cartController = require("./ecommerce/cart.controller");
const addressController = require("./ecommerce/address.controller");
const emailController = require("./auth/email.controller");
const orderController = require("./ecommerce/order.controller");
const categoryController = require("./ecommerce/category.controller");

module.exports = {
  authController,
  userController,
  productController,
  cartController,
  orderController,
  emailController,
  categoryController,
  addressController,
};
