const mongoose = require('mongoose');

const connect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DBNAME,
      user: process.env.USER,
      pass: process.env.PASS,
    });
  
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connect;
