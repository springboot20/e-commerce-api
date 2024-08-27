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
    stock,
  });

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
        category: new mongoose.Types.ObjectId(categoryId),
      },
    },
  ]);

  const paginatedProducts = await model.ProductModel.aggregatePaginate(
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

  console.log(paginatedProducts);

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

  if (updatedProductImageSrc.url !== product.imageSrc.url) {
    removeFileOnError(product.imageSrc.url);
  }

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
        stock,
      },
    },
    { new: true },
  );

  return new ApiResponse(StatusCodes.OK, "product updated successfully", {
    product: updatedProduct,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await model.ProductModel.findOneAndDelete({ _id: productId });

  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "product not found", []);

  removeFileOnError(product.imageSrc.localPath);

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
        $match: name
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
  getAllProducts,
};
