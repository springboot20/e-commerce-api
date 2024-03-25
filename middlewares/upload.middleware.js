const multer = require('multer');

const storage = multer.discStorage({
  destination: (req, file, callback) => {
    callback(null, './public/uploads/');
  },
  filename: (req, file, callback) => {
    let fileExtension = '';
    if (file.originalname.split('.').length > 0) {
      fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));
    }

    const filenameWithoutExtension = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-')
      ?.split('.')[0];

    callback(
      null,
      `${filenameWithoutExtension}${Date.now()}${Math.ceil(Math.random() * 1000)}.${fileExtension}`
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1000 * 1000,
  },
});

module.exports = { upload };
