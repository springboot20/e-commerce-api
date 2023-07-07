const mongoose = require('mongoose');

const transactions = (fn) => {
  return async (req, res) => {
    let result;
    await mongoose.connection.transaction(async (session) => {
      result = await fn(req, res, session);
      return result;
    });
    return result;
  };
};

module.exports = transactions;
