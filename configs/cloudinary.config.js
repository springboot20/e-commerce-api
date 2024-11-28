const cloudinary = require("cloudinary").v2;
const { ApiError } = require("../utils/api.error");
const dotenv = require("dotenv");
const { StatusCodes } = require("http-status-codes");

dotenv.config();

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_NAME,
});

/**
 *
 * @param {Buffer} buffer
 * @param {string} folder
 * @return {Promise<import("cloudinary").UploadApiResponse>}
 */
const uploadFileToCloudinary = async (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "auto", folder }, (error, result) => {
        if (error) {
          reject(new ApiError(StatusCodes.BAD_REQUEST, error.message));
        } else {
          resolve(result);
        }
      })
      .end(buffer);
  });
};

/**
 *
 * @param {string} public_id
 * @param {string} resource_type
 * @param {string} type
 *
 */
const deleteFileFromCloudinary = async (public_id, resource_type = "image", type = "image") => {
  try {
    const deletedResource = await cloudinary.uploader.destroy(
      public_id,
      {
        resource_type,
        type,
      },
      (error, result) => {
        if (error) {
          new ApiError(StatusCodes.BAD_REQUEST, error.message);
        } else {
          return result;
        }
      },
    );

    if (deletedResource.result === "not found") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Public ID not found. Provide a valid publicId.");
    }

    if (deletedResource.result !== "ok") {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Error while deleting existing file. Try again.",
      );
    }
  } catch (error) {
    // Wrap errors with ApiError for consistent error handling
    throw error instanceof ApiError
      ? error
      : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = { uploadFileToCloudinary, deleteFileFromCloudinary };