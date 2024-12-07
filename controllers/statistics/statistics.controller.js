const productsStatistics = require("./product/product.statistics.controller");
const usersStatistics = require("./product/product.statistics.controller");
const ordersStatistics = require("./order/order.statistics.controller");
const allStatistics = require("./all.controller");

module.exports = { productsStatistics, ordersStatistics, usersStatistics, allStatistics };
