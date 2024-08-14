const mongoose = require("mongoose");

const connect = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DBNAME,
      user: process.env.USER,
      pass: process.env.PASS,
    });

    console.log(`\n☘️  MongoDB connected successfully: ${connectionInstance.connection.host}\n`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connect;
