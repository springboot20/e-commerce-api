const mongoose = require("mongoose");

const connect = async () => {
  try {
    const connectionString =
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI
        : process.env.MONGODB_URI_LOCAL;

    const connectData =
      process.env.NODE_ENV === "production"
        ? {
            dbName: process.env.DBNAME,
            user: process.env.USER,
            pass: process.env.PASS,
          }
        : {
            dbName: process.env.DBNAME,
          };
    const connectionInstance = await mongoose.connect(connectionString, connectData);

    console.log(`\n☘️  MongoDB connected successfully: ${connectionInstance.connection.host}\n`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connect;
