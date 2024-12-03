const createAddress = require("./create/create.address.controller");
const userAddress = require("./user-address/user.address.controller");
const getAllAddresses = require("./all-address/addresses.controller");

module.exports = { createAddress, userAddress, getAllAddresses };
