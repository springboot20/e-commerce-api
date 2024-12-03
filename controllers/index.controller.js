const authController = require("./auth/auth.controller");
const userController = require("./auth/user.controller");
const emailController = require("./auth/email.controller");
const productController = require("./ecommerce/product/product.controller");
const addressController = require("./ecommerce/address/index.controller");
const categoryController = require("./ecommerce/category/index.controller");
const orderController = require("./ecommerce/order/order.controller");
const cartController = require("./ecommerce/cart/cart.controller");
const statisticsController = require("./statistics/statistics.controller");

module.exports = {
  authController,
  userController,
  productController,
  cartController,
  statisticsController,
  orderController,
  emailController,
  categoryController,
  addressController,
};
