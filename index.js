const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const routers = require('./routes/index');

const dataBaseConnection = require('./connection/connection');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();
dataBaseConnection();

const app = express();
const PORT = process.env.PORT | 5000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));

app.use('/api/users', routers.usersRouter);
app.use('/api/products', routers.productsRouter);
app.use('/api/carts', routers.cartsRouter);
app.use('/api/orders', routers.ordersRouter);

app.get('/', () => {
  res.send('Welcome Springboot20 E-commerce Api');
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
