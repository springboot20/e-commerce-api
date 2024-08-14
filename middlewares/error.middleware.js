const { StatusCodes } = require("http-status-codes");
const { ApiError } = require("../utils/api.error");
const { default: mongoose } = require("mongoose");

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const message = error.message || "something went wrong";

    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? StatusCodes.BAD_REQUEST
        : StatusCodes.INTERNAL_SERVER_ERROR;

    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const errorResponse = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "production" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(errorResponse);
};

module.exports = { errorMiddleware };
