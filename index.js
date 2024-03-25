require('dotenv').config({ path: './env' });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const routers = require('./routes/index.routes');

const dataBaseConnection = require('./connection/connection');
const notFound = require('./middlewares/notFound');
const { errorMiddleware } = require('./middlewares/error.middleware');

dataBaseConnection();

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));

app.use('/api/v1/users', routers.usersRouter);
app.use('/api/v1/products', routers.productsRouter);
app.use('/api/v1/carts', routers.cartsRouter.router);
app.use('/api/v1/orders', routers.ordersRouter);

app.get('/', () => {
  res.send('Welcome Springboot20 E-commerce Api');
});

app.use(notFound);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
