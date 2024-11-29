require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const routers = require("./routes/index.routes");

const dataBaseConnection = require("./connection/connection");
const notFound = require("./middlewares/notFound");
const { errorMiddleware } = require("./middlewares/error.middleware");

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(express.json());

const allowedOrigins = [process.env.CORS_ORIGIN];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser(process.env.JWT_SECRET));

app.use("/api/v1/users", routers.usersRouter);
app.use("/api/v1/products", routers.productsRouter);
app.use("/api/v1/orders", routers.ordersRouter);
app.use("/api/v1/categories", routers.categoryRouter);
app.use("/api/v1/addresses", routers.addressesRouter);
app.use("/api/v1/carts", routers.cartsRouter);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use(notFound);
app.use(errorMiddleware);

const serverConnection = () => {
  app.listen(PORT, () => {
    console.log(`⚙️⚡ Server running at http://localhost:${PORT} 🌟🌟`);
  });
};

mongoose.connection.on("connected", () => {
  console.log("mongodb connected...");
});

process.on("SIGINT", () => {
  mongoose.connection.once("disconnect", () => {
    console.log("Mongodb disconnected..... ");
    process.exit(0);
  });
});

dataBaseConnection()
  .then(() => {
    serverConnection();
  })
  .catch((error) => {
    console.log(error);
  });
