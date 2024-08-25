const model = require("../../models/index");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/api.error");
const { ApiResponse } = require("../../utils/api.response");
const {
  getFileStaticPath,
  getFileLocalPath,
  removeFileOnError,
  getMognogoosePagination,
} = require("../../helpers");
const { MAX_SUB_IMAGES_TO_BE_UPLOAD } = require("../../constants");
const { default: mongoose } = require("mongoose");

const createNewProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, stock, featured } = req.body;

  const productCategory = await model.CategoryModel.findById(category);

  if (!productCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, "product category does not exists", []);
  }

  if (!req.files.imageSrc || !req.files.imageSrc.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "no images upload", []);
  }

  const imageStaticUrl = getFileStaticPath(req, req.files.imageSrc[0]?.filename);
  const imageLocalPath = getFileLocalPath(req.files.imageSrc[0]?.filename);

  /**
   * @type {{url:string; localPath:string}[]}
   * @returns {{url: string; localPath: string}}
   */
  const productSubImages =
    req.files.subImgs && req.files.subImgs?.length
      ? req.file.subImgs.map((image) => {
          const subImageStaticUrl = getFileStaticPath(req, image.filename);
          const subImageLocalUrl = getFileLocalPath(image.filename);
          return {
            url: subImageStaticUrl,
            localPath: subImageLocalUrl,
          };
        })
      : [];

  const user = req.user._id;

  const createdProduct = await model.ProductModel.create({
    user,
    name,
    price,
    description,
    category,
    featured,
    imageSrc: {
      url: imageStaticUrl,
      localPath: imageLocalPath,
    },
    category: productCategory,
    subImgs: productSubImages,
    stock,
  });

  console.log(productSubImages);

  return new ApiResponse(StatusCodes.CREATED, "product created successfully", {
    product: createdProduct,
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await model.ProductModel.findById(productId);

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "product not found", []);
  }

  return new ApiResponse(StatusCodes.OK, "product fetched successfully", { product });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 15 } = req.query;

  const productCategory = await model.CategoryModel.findById(categoryId).select("name _id");

  if (!productCategory) throw new ApiError(StatusCodes.NOT_FOUND, "category not found");

  const productAggregate = model.ProductModel.aggregate([
    {
      $match: {
        category: {
          _id: new mongoose.Types.ObjectId(categoryId),
        },
      },
    },
  ]);

  const paginatedProducts = model.ProductModel.aggregatePaginate(
    productAggregate,
    getMognogoosePagination({
      limit,
      page,
      customLabels: {
        totalDocs: "totalProducts",
        docs: "products",
      },
    }),
  );

  return new ApiResponse(StatusCodes.OK, "products category fetched successfully", {
    products: paginatedProducts,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, price, description, category, stock, featured } = req.body;

  const product = await model.ProductModel.findById(productId);

  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "product not found", []);

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
      `Sub images to be upload must not greater than ${MAX_SUB_IMAGES_TO_BE_UPLOAD}`,
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
        featured,
        imageSrc: updatedProductImageSrc,
        category: category,
        subImgs: productSubImages,
        stock,
      },
    },
    { new: true },
  );

  return new ApiResponse(StatusCodes.OK, "product updated successfully", {
    product: updatedProduct,
  });
});

const removeImageSubImage = asyncHandler(async (req, res) => {
  const { productId, subImageId } = req.params;

  const product = await model.ProductModel.findById(productId);

  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "product not found", []);

  const updatedProduct = await model.ProductModel.findByIdAndUpdate(
    productId,
    {
      $pull: {
        subImgs: {
          _id: new mongoose.Types.ObjectId(subImageId),
        },
      },
    },
    { new: true },
  );

  const removeSubImageFromLocal = product.subImgs.find((image) => {
    return image._id.toString() === subImageId;
  });

  if (removeSubImageFromLocal) {
    removeFileOnError(removeSubImageFromLocal.localPath);
  }

  return new ApiResponse(StatusCodes.OK, "product sub image deleted successfully", {
    product: updatedProduct,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await model.ProductModel.findOneAndDelete({ _id: productId });

  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "product not found", []);

  const productImages = [product.imageSrc, ...product.subImgs];

  productImages.map((img) => removeFileOnError(img.localPath));

  return new ApiResponse(StatusCodes.OK, "product deleted successfully", {});
});

const getAllProducts = asyncHandler(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async (req, res) => {
    const { page = 1, limit = 15, featured, name } = req.query;

    const productsAggregate = model.ProductModel.aggregate([
      {
        $match: featured
          ? {
              featured: Boolean(featured),
            }
          : {},
      },
      {
        $match:
          name.length > 0
            ? {
                name: {
                  $regex: name.trim(),
                  $options: "i",
                },
              }
            : {},
      },
    ]);

    const paginatedProducts = await model.ProductModel.aggregatePaginate(
      productsAggregate,
      getMognogoosePagination({
        limit,
        page,
        customLabels: {
          totalDocs: "totalProducts",
          docs: "products",
        },
      }),
    );

    return new ApiResponse(StatusCodes.OK, "product deleted successfully", {
      products: paginatedProducts,
    });
  },
);

module.exports = {
  createNewProduct,
  getProduct,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  removeImageSubImage,
  getAllProducts,
};
