const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const userRouter = require('./routes/user.js');

const dataBaseConnection = require('./connection/connection');

dotenv.config();
dataBaseConnection();

const app = express();
const PORT = process.env.PORT | 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('api/v1/users', userRouter);

app.get('/', () => {
  res.send('Welcome Springboot20 E-commerce Api');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
