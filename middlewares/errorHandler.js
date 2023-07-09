const { StatusCodes } = require('http-status-codes');

const errorHandler = (err, req, res, next) => {
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'something went wrong',
  };

  if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
    customError.statusCode = 404;
  }

  if (err.code && err.code === 11000) {
    customError.message = `duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`;
    customError.statusCode = 400;
  }

  if (err.name === 'CastError') {
    customError.statusCode = 404;
    customError.message = `No item found with id:${err.value}`;
  }

  return res.status(customError.statusCode).json({ message: customError.message });
};

module.exports = errorHandler;
