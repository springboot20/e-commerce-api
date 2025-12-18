const multer = require('multer');
const { uploadLocalFiles } = require('../helpers');

const HOME_UPLOAD_DIRECTORY = 'public';

const devMode = process.env.NODE_ENV;
const productStorage = multer.memoryStorage();

/**
 *
 * @param {string} uploadType
 * @param {string} uploadDirectory
 * @returns {multer.StorageEngine}
 */
const developmentStorage = (uploadDirectory) => {
  return multer.diskStorage({
    destination: (req, file, callbackFn) => {
      uploadDirectory = `./${HOME_UPLOAD_DIRECTORY}/${uploadDirectory}`;

      callbackFn(null, uploadLocalFiles(uploadDirectory));
    },

    filename: (req, file, callbackFn) => {
      let fileExtension = '';
      if (file.originalname.split('.').length > 1) {
        fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));
      }

      const filenameWithoutExtension = file.originalname
        .toLowerCase()
        .split(' ')
        .join('-')
        ?.split('.')[0];

      callbackFn(
        null,
        filenameWithoutExtension + Date.now() + Math.ceil(Math.random() * 1e5) + fileExtension
      );
    },
  });
};

const upload = (uploadType, uploadDirectory) => () => {
  return multer({
    storage:
      devMode === 'development' ? developmentStorage(uploadType, uploadDirectory) : productStorage,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  });
};

module.exports = { upload };
