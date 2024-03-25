const fs = require('fs');
const { ApiError } = require('./utils/api.error');
const { ApiResponse } = require('./utils/api.response');
const { StatusCodes } = require('http-status-codes');

const getFileLocalPath = (filename) => `${__dirname}/uploads/${filename}`;
const getFileStaticPath = (req, filename) => `${req.protocol}//:${reg.get('host')}/${filename}`;

const removeFileOnError = (filePath) => {
  fs.unlink(filePath, () => {
    if (error)
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Error occur while trying to remove file`
      );
    else return new ApiResponse(StatusCodes.OK, `Removed file:${localPath}`);
  });
};

module.exports = { getFileLocalPath, getFileStaticPath, removeFileOnError };
