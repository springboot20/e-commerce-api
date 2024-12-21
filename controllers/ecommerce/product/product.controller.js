const model = require("../../../models/index");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../../utils/asyncHandler");
const { ApiError } = require("../../../utils/api.error");
const { ApiResponse } = require("../../../utils/api.response");
const { getMognogoosePagination, removeCircularReferences } = require("../../../helpers");

const { default: mongoose } = require("mongoose");
const {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} = require("../../../configs/cloudinary.config");

const createNewProduct = asyncHandler(
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns
   */
  async (req, res) => {
    const { name, price, description, category, stock, featured, colors, sizes } = req.body;

    const normalizedCategoryName = category.trim().toLowerCase();

    let productCategory = await model.CategoryModel.findOne({ name: normalizedCategoryName });

    if (!productCategory) {
      productCategory = await model.CategoryModel.create({
        name: normalizedCategoryName,
        owner: req.user._id,
      });
    }

    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "no image upload", []);
    }

    let uploadImage;

    if (req.file) {
      uploadImage = await uploadFileToCloudinary(
        req.file.buffer,
        `${process.env.CLOUDINARY_BASE_FOLDER}/products-image`,
      );
    }
    const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    console.log(parsedSizes);
    const user = req.user._id;

    const productData = {
      user,
      name,
      price,
      description,
      category: productCategory?._id,
      featured,
      imageSrc: {
        url: uploadImage?.secure_url,
        public_id: uploadImage?.public_id,
      },
      stock,
      colors: colors || [], // Ensure colors is an array
      sizes: Array.isArray(parsedSizes)
        ? parsedSizes.map((size) => ({
            name: size.name?.trim(), // Ensure the name is trimmed
            inStock: !!size.inStock, // Ensure inStock is a boolean
          }))
        : [],
    };

    console.log(productData);

    // Create the product in the database
    const createdProduct = await model.ProductModel.create(productData);

    return new ApiResponse(StatusCodes.CREATED, "product created successfully", {
      product: createdProduct,
    });
  },
);

const getProduct = asyncHandler(
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns
   */
  async (req, res) => {
    const { productId } = req.params;
    const product = await model.ProductModel.findById(productId).populate("category");

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "product not found", []);
    }

    return new ApiResponse(StatusCodes.OK, "product fetched successfully", { product });
  },
);

const getProductsByCategory = asyncHandler(
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns
   */
  async (req, res) => {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

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

    return new ApiResponse(
      StatusCodes.OK,
      "products category fetched successfully",
      paginatedProducts,
    );
  },
);

const updateProduct = asyncHandler(
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns
   */
  async (req, res) => {
    const { productId } = req.params;
    const { name, price, description, category, stock, featured, colors, sizes } = req.body;

    // Find the product
    const product = await model.ProductModel.findById(productId);
    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "product not found", []);

    let uploadImage;

    // Initialize the fields to update
    let updatedFields = {
      user: req.user._id,
      name,
      price,
      description,
      featured,
      category: product?.category,
      stock,
    };

    // Handle image upload
    if (req.file) {
      if (product.imageSrc?.public_id) {
        await deleteFileFromCloudinary(product.imageSrc?.public_id);
      }

      uploadImage = await uploadFileToCloudinary(
        req?.file?.buffer,
        `${process.env.CLOUDINARY_BASE_FOLDER}/products-image`,
      );

      updatedFields.imageSrc = {
        url: uploadImage?.secure_url,
        public_id: uploadImage?.public_id,
      };
    }

    // Handle category update
    if (category) {
      const normalizedCategoryName = category.trim().toLowerCase();

      let existingCategory = await model.CategoryModel.findOne({ name: normalizedCategoryName });
      if (!existingCategory) {
        existingCategory = await model.CategoryModel.create({
          name: normalizedCategoryName,
          owner: req.user?._id,
        });

        updatedFields.category = existingCategory?._id;
      } else {
        updatedFields.category = existingCategory?._id;
      }
    }

    // If sizes is a string, parse it into an array of objects
    if (typeof sizes === "string") {
      try {
        sizes = JSON.parse(sizes);
      } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid sizes format");
      }
    }

    // Conditionally update colors and sizes if present in the request body
    if (colors?.length) {
      updatedFields.colors = colors; // Update colors if provided
    }

    if (sizes?.length) {
      updatedFields.sizes = sizes; // Update sizes if provided
    }

    // Update the product in the database
    const updatedProduct = await model.ProductModel.findByIdAndUpdate(
      productId,
      {
        $set: updatedFields,
      },
      { new: true },
    ).populate("category");

    // Respond with the updated product
    return new ApiResponse(StatusCodes.OK, "Product updated successfully", {
      product: updatedProduct,
    });
  },
);

const deleteProduct = asyncHandler(
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns
   */
  async (req, res) => {
    const { productId } = req.params;

    const product = await model.ProductModel.findById(productId);

    if (!product) throw new ApiError(StatusCodes.NOT_FOUND, "product not found", []);

    if (product?.imageSrc?.public_id !== null) {
      await deleteFileFromCloudinary(product?.imageSrc?.public_id);
    }

    await model.ProductModel.findOneAndDelete({ _id: productId });

    return new ApiResponse(StatusCodes.OK, "product deleted successfully", {});
  },
);

const getAllProducts = asyncHandler(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async (req, res) => {
    const { page = 1, limit = 10, featured, name } = req.query;

    const productsAggregate = model.ProductModel.aggregate([
      {
        $match:
          featured !== undefined
            ? {
                featured: JSON.parse(featured),
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

    return new ApiResponse(StatusCodes.OK, "products fetched successfully", paginatedProducts);
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
