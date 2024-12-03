const usersRouter = require("./auth/user.routes");
const productsRouter = require("./ecommerce/product/product.routes");
const categoryRouter = require("./ecommerce/category/category.routes");
const ordersRouter = require("./ecommerce/order/order.routes");
const cartsRouter = require("./ecommerce/cart/cart.routes");
const addressesRouter = require("./ecommerce/address/address.routes");

module.exports = {
  usersRouter,
  productsRouter,
  ordersRouter,
  categoryRouter,
  cartsRouter,
  addressesRouter,
};
