const { StatusCodes } = require("http-status-codes");

const asyncHandler = (callbackFunc) => {
  return async (req, res, next) => {
    try {
      let nextCalled = false;
      const result = await callbackFunc(req, res, (params) => {
        nextCalled = true;
        next(params);
      });

      if (!res.headersSent && !nextCalled) {
        res.status(StatusCodes.OK).json(result);
      }
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { asyncHandler };
