require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');

const routers = require('./routes/index.routes');

const dataBaseConnection = require('./connection/connection');
const notFound = require('./middlewares/notFound');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { intializeSocketIo } = require('./socket/socket.config');

const app = express();
const PORT = process.env.PORT ?? 5000;
const server = http.createServer(app);

// socket io connection setups
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});
intializeSocketIo(io);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.set('io', io);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser(process.env.JWT_SECRET));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', process.env.CORS_ORIGIN);

  next();
});

app.use('/api/v1/users', routers.usersRouter);
app.use('/api/v1/products', routers.productsRouter);
app.use('/api/v1/orders', routers.ordersRouter);
app.use('/api/v1/categories', routers.categoryRouter);
app.use('/api/v1/addresses', routers.addressesRouter);
app.use('/api/v1/carts', routers.cartsRouter);
app.use('/api/v1/statistics', routers.statisticsRouter);

const serverConnection = () => {
  server.listen(PORT, () => {
    console.log(`⚙️⚡ Server running at http://localhost:${PORT} 🌟🌟`);
  });
};

mongoose.connection.on('connected', () => {
  console.log('mongodb connected...');
});

process.on('SIGINT', () => {
  mongoose.connection.once('disconnect', () => {
    console.log('Mongodb disconnected..... ');
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
