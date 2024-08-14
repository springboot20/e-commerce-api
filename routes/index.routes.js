const usersRouter = require('./auth/user.routes');
const productsRouter = require('./ecommerce/product.routes');
const categoryRouter = require('./ecommerce/category.routes');
const ordersRouter = require('./ecommerce/order.routes');

module.exports = {
  usersRouter,
  productsRouter,
  ordersRouter,
  categoryRouter,
};
