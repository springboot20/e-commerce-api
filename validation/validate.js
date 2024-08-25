const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/api.error");
const { StatusCodes } = require("http-status-codes");

const validate = (req, res, next) => {
  const validateResult = validationResult(req);

  if (validateResult.isEmpty()) {
    return next();
  } else {
    let extractedErrors = [];
    validateResult.array().map((error) => extractedErrors.push({ [error.path]: error.msg }));

    throw new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      "Received data is not valid",
      extractedError,
    );
  }
};

module.exports = validate;
