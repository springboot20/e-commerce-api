const pathModule = require('path');
const fileSystemModule = require('fs');

const HOME_UPLOAD_DIRECTORY = 'public';

/**
 *
 * @param {number} limit
 * @returns {import("mongoose").PaginateOptions}
 */
const getMongoosePagination = ({ limit = 10, page = 1, customLabels }) => {
  return {
    limit: Math.max(limit, 1),
    page: Math.max(page, 1),
    customLabels: {
      pagingCounter: 'serial_counter',
      ...customLabels,
    },
  };
};

/**
 *
 * @param {string} uploadType
 * @param {string} uploadDirectory
 *
 * @returns
 */
const uploadLocalFiles = (uploadDirectory) => {
  let fileDir;
  if (uploadDirectory === undefined) {
    uploadDirectory = HOME_UPLOAD_DIRECTORY;

    fileDir = pathModule.resolve(__dirname, uploadDirectory);
  } else {
    console.log(uploadDirectory);
    fileDir = pathModule.resolve(__dirname, `${uploadDirectory}`);
  }

  if (fileSystemModule.existsSync(fileDir)) {
    fileSystemModule.rmdir(fileDir, (error) => {
      if (error) console.log('', error);
    });
  } else {
    fileSystemModule.mkdirSync(fileDir, { recursive: true });
  }

  return fileDir;
};

/**
 *
 * @param {import("express").Request} req
 * @param {string} fileName
 * @param {string} directory
 * @description returns the file's static path from where the server is serving the static image
 */
const getStaticFilePath = (req, fileName, directory) => {
  if (directory === undefined) {
    return `${req.protocol}://${req.get('host')}/public/${fileName}`;
  } else return `${req.protocol}://${req.get('host')}/public/${directory}/${fileName}`;
};

/**
 *
 * @param {string} fileName
 * @param {string} directory
 * @description returns the file's local path in the file system to assist future removal
 */
const getLocalPath = (fileName, directory) => {
  if (directory === undefined) {
    return `public/${fileName}`;
  } else return `public/${directory}/${fileName}`;
};

/**
 *
 * @param {string} localPath
 * @description Removed the local file from the local file system based on the file path
 */
const removeLocalFile = (localPath) => {
  fileSystemModule.unlink(localPath, (err) => {
    if (err) console.log('Error while removing local files: ', err);
    else {
      console.log('Removed local: ', localPath);
    }
  });
};

/**
 *
 * @param {*} obj
 * @returns
 */
const removeLocalUploadedFiles = () => {};

function removeCircularReferences(obj) {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    })
  );
}

module.exports = {
  getMongoosePagination,
  removeCircularReferences,
  uploadLocalFiles,
  removeLocalUploadedFiles,
  getStaticFilePath,
  getLocalPath,
  removeLocalFile,
};
