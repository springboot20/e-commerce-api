const model = require("../../../models/index");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../../utils/asyncHandler");
const { ApiError } = require("../../../utils/api.error");
const { ApiResponse } = require("../../../utils/api.response");
const { getMognogoosePagination } = require("../../../helpers");
const { emitSocketEventToUser, emitSocketEventToAdmin } = require("../../../socket/socket.config");
const {
  NEW_PRODUCT_ADDED,
  PRODUCT_DELETED,
  UPDATED_PRODUCT,
} = require("../../../enums/socket-events");

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
        `${process.env.CLOUDINARY_BASE_FOLDER}/products-image`
      );
    }
    const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    const parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors;

    console.log(parsedSizes);
    console.log(colors);
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
      colors: Array.isArray(parsedColors) ? parsedColors : [], // Ensure colors is an array
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

    emitSocketEventToUser(req, NEW_PRODUCT_ADDED, {
      event_type: "product",
      data: createdProduct,
      message: "new product added to store",
    });

    return new ApiResponse(StatusCodes.CREATED, "product created successfully", {
      product: createdProduct,
    });
  }
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
    const product = await model.ProductModel.findById(productId)
      .populate("category")
      .populate("rating");

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "product not found", []);
    }

    return new ApiResponse(StatusCodes.OK, "product fetched successfully", { product });
  }
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
      })
    );

    console.log(paginatedProducts);

    return new ApiResponse(
      StatusCodes.OK,
      "products category fetched successfully",
      paginatedProducts
    );
  }
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
    const { name, price, description, category, stock, featured, colors } = req.body;
    let { sizes } = req.body;

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
        `${process.env.CLOUDINARY_BASE_FOLDER}/products-image`
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

    // Parse sizes properly based on its type
    if (sizes) {
      try {
        // If sizes is a string, try to parse it as JSON
        if (typeof sizes === "string") {
          sizes = JSON.parse(sizes);
        }

        // Ensure sizes is an array
        if (Array.isArray(sizes)) {
          updatedFields.sizes = sizes;
        } else {
          throw new ApiError(StatusCodes.BAD_REQUEST, "Sizes must be an array");
        }
      } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid sizes format: " + error.message);
      }
    }

    // Handle colors if present
    if (colors) {
      try {
        let parsedColors = colors;

        // If colors is a string, try to parse it as JSON
        if (typeof colors === "string") {
          parsedColors = JSON.parse(colors);
        }

        // Ensure colors is an array
        if (Array.isArray(parsedColors)) {
          updatedFields.colors = parsedColors;
        } else {
          throw new ApiError(StatusCodes.BAD_REQUEST, "Colors must be an array");
        }
      } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid colors format: " + error.message);
      }
    }

    // Update the product in the database
    const updatedProduct = await model.ProductModel.findByIdAndUpdate(
      productId,
      {
        $set: updatedFields,
      },
      { new: true }
    ).populate("category");

    emitSocketEventToUser(req, UPDATED_PRODUCT, {
      event_type: "product",
      data: updatedProduct,
      message: "Product updated successfully",
    });

    // Respond with the updated product
    return new ApiResponse(StatusCodes.OK, "Product updated successfully", {
      product: updatedProduct,
    });
  }
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

    const deletedProduct = await model.ProductModel.findOneAndDelete({ _id: productId });

    console.log(deletedProduct);

    emitSocketEventToAdmin(req, PRODUCT_DELETED, {
      event_type: "product",
      message: "product deleted successfully",
      data: deletedProduct,
    });

    emitSocketEventToUser(req, PRODUCT_DELETED, {
      event_type: "product",
      message: "product deleted successfully",
      data: deletedProduct,
    });

    return new ApiResponse(StatusCodes.OK, "product deleted successfully", {});
  }
);

const getAllProducts = asyncHandler(
  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async (req, res) => {
    const { page = 1, limit = 10, featured, name, price, colors, sizes } = req.query;

    console.log({ sizes, colors });

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
      {
        $match: colors
          ? {
              colors: {
                $in: typeof colors === "string" ? colors.split(",") : colors,
              },
            }
          : {},
      },
      {
        $match: sizes
          ? {
              "sizes.name": {
                $in:
                  typeof sizes === "string"
                    ? sizes.split(",").map((size) => size.toUpperCase())
                    : sizes.map((size) => size.toUpperCase()),
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
      })
    );

    return new ApiResponse(StatusCodes.OK, "products fetched successfully", paginatedProducts);
  }
);

module.exports = {
  createNewProduct,
  getProduct,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  getAllProducts,
};
