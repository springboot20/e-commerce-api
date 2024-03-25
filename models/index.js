const UserModel = require('./auth/user.model.js');
const ProductModel = require('./ecommerce/product.model.js');
const OrderModel = require('./ecommerce/order.model.js');
const CartModel = require('./ecommerce/cart.model.js');
const AddressModel = require('./ecommerce/address.model.js');
const CategoryModel = require('./ecommerce/category.model.js');

module.exports = {
  UserModel,
  ProductModel,
  OrderModel,
  CartModel,
  AddressModel,
  CategoryModel,
};
