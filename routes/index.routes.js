const usersRouter = require('./auth/user.routes');
const productsRouter = require('./ecommerce/product');
const cartsRouter = require('./ecommerce/cart');
const ordersRouter = require('./ecommerce/order.routes');

module.exports = {
  usersRouter,
  productsRouter,
  ordersRouter,
  cartsRouter,
};
