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

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser(process.env.JWT_SECRET));

app.use("/api/v1/users", routers.usersRouter);
app.use("/api/v1/products", routers.productsRouter);
app.use("/api/v1/orders", routers.ordersRouter);
app.use("/api/v1/categories", routers.categoryRouter);
app.use("/api/v1/addresses", routers.addressesRouter);
app.use("/api/v1/carts", routers.cartsRouter);
app.use("/api/v1/statistics", routers.statisticsRouter);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*");

  next();
});

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

app.use(notFound);
app.use(errorMiddleware);
