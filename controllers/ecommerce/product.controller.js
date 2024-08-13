const model = require('../../models/index');
const { StatusCodes } = require('http-status-codes');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../utils/api.error');
const { ApiResponse } = require('../../utils/api.response');
const { getFileStaticPath, getFileLocalPath, removeFileOnError } = require('../../helpers');
const { MAX_SUB_IMAGES_TO_BE_UPLOAD } = require('../../constants');

const createNewProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, stock } = req.body;

  const productCategory = await model.Category.findOne({ _id: category });

  if (!productCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'product category does not exists', []);
  }

  if (!req.files.imageSrc || !req.files.imageSrc.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'not images upload', []);
  }

  const imageStaticUrl = getFileStaticPath(req, req.files.imageSrc[0]?.filename);
  const imageLocalPath = getFileLocalPath(req.files.imageSrc[0]?.filename);

  const productSubImages =
    req?.files?.subImgs && req?.files?.subImgs.length
      ? req?.file?.subImgs.map((image) => {
          const subImageStaticUrl = getFileStaticPath(req, image.filename);
          const subImageLocalUrl = getFileLocalPath(image.filename);

          return {
            url: subImageStaticUrl,
            localPath: subImageLocalUrl,
          };
        })
      : [];

  const createdProduct = await model.ProductModel.create({
    user: req.user._id,
    name,
    price,
    description,
    imageSrc: {
      url: imageStaticUrl,
      localPath: imageLocalPath,
    },
    category: productCategory,
    subImgs: productSubImages,
    stock,
  });

  return new ApiResponse(StatusCodes.CREATED, 'product created successfully', {
    product: createdProduct,
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await model.ProductModel.findById(id);

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'product not found', []);
  }

  return new ApiResponse(StatusCodes.OK, 'product fetched successfully', { product });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const productCategory = await model.CategoryModel.findById(categoryId).select('name _id');

  if (!productCategory) throw new ApiError(StatusCodes.NOT_FOUND, 'category not found');

  return new ApiResponse(StatusCodes.OK, 'products category fetched successfully', {
    productCategory,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, price, description, category, stock } = req.body;

  const product = await model.ProductModel.findById(productId);

  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'product not found', []);

  const imageUrl = getFileStaticPath(req, req.files.imageSrc?.filename);
  const imageLocalPath = getFileLocalPath(req.files.imageSrc?.filename);

  const updatedProductImageSrc = req.file.imageSrc.length
    ? {
        url: imageUrl,
        localPath: imageLocalPath,
      }
    : product.imageSrc;

  let productSubImages =
    req?.files?.subImgs && req?.files?.subImgs.length
      ? req?.file?.subImgs.map((image) => {
          const subImageStaticUrl = getFileStaticPath(req, image.filename);
          const subImageLocalUrl = getFileLocalPath(image.filename);

          return {
            url: subImageStaticUrl,
            localPath: subImageLocalUrl,
          };
        })
      : [];

  const totalSubImages = product.subImgs.length + productSubImages.length;

  if (totalSubImages > MAX_SUB_IMAGES_TO_BE_UPLOAD) {
    productSubImages.map((image) => removeFileOnError(image.url));

    if (updatedProductImageSrc.url !== product.imageSrc.url) {
      removeFileOnError(product.imageSrc.url);
    }

    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Sub images to be upload must not greater than ${MAX_SUB_IMAGES_TO_BE_UPLOAD}`
    );
  }

  productSubImages = [...productSubImages, ...product.subImgs];

  const updatedProduct = await model.ProductModel.findByIdAndUpdate(
    productId,
    {
      $set: {
        user: req.user._id,
        name,
        price,
        description,
        imageSrc: updatedProductImageSrc,
        category: category,
        subImgs: productSubImages,
        stock,
      },
    },
    { new: true }
  );

  return new ApiResponse(StatusCodes.OK, 'product updated successfully', {
    product: updatedProduct,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId, subImageId } = req.params;

  const product = await model.ProductModel.findById(productId);

  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'product not found', []);


});

module.exports = {
  createNewProduct,
  getProduct,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
};
