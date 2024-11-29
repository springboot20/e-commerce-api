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

app.use(cors());

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
  const allowedOrigins = ["https://cv-ecommerce-project.vercel.app/"];
  const origin = req.headers.origin;

  if (allowedOrigins.indexOf(origin) != -1) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,Content-Type,Authorization,Accept,X-Requested-With,Cookie,User-Agent,Host,Referer",
  );
  res.header("Access-Control-Expose-Headers", "Content-Disposition");
  if ("OPTIONS" == req.method) {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    res.sendStatus(200);
  } else {
    next();
  }
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
