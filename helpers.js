const fs = require("fs");
const { ApiError } = require("./utils/api.error");
const { ApiResponse } = require("./utils/api.response");
const { StatusCodes } = require("http-status-codes");
const { default: mongoose } = require("mongoose");

const getFileLocalPath = (filename) => `${__dirname}/public/uploads/${filename}`;
const getFileStaticPath = (req, filename) => `${req.protocol}://${req.get("host")}/uploads/${filename}`;

const removeFileOnError = (filePath) => {
  fs.unlink(filePath, (error) => {
    if (error) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Error occur while trying to remove file`,
      );
    } else {
      console.log(StatusCodes.OK, `Removed file:${filePath}`);
    }
  });
};

/**
 *
 * @param {*} limit
 * @returns {mongoose.PaginateOptions}
 */
const getMognogoosePagination = ({ limit = 10, page = 1, customLabels }) => {
  return {
    limit: Math.max(limit, 1),
    page: Math.max(page, 1),
    customLabels: {
      pagingCounter: "serial_counter",
      ...customLabels,
    },
  };
};

module.exports = {
  getFileLocalPath,
  getFileStaticPath,
  removeFileOnError,
  getMognogoosePagination,
};
