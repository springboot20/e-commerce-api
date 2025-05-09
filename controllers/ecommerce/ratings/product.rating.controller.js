const model = require("../../../models/index");
const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../../utils/asyncHandler");
const { ApiError } = require("../../../utils/api.error");
const { ApiResponse } = require("../../../utils/api.response");
const { getMognogoosePagination } = require("../../../helpers");
const { emitSocketEventToUser } = require("../../../socket/socket.config");
const {
  PRODUCT_RATING_WITHOUT_COMMENT,
  PRODUCT_RATING_WITH_COMMENT,
} = require("../../../enums/socket-events");
const { default: mongoose } = require("mongoose");

/**
 * Helper function to update product's rating statistics
 * @param {string} productId - ID of the product to update
 */
const updateProductRatingStats = async (productId) => {
  const aggregateResult = await model.RatingModel.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rate" },
        totalRatings: { $sum: 1 },
        ratingCounts: {
          $push: "$rate",
        },
      },
    },
  ]);

  if (aggregateResult.length === 0) {
    return;
  }

  const result = aggregateResult[0];

  // Calculate distribution of ratings (1-5 stars)
  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  result.ratingCounts.forEach((rating) => {
    const roundedRating = Math.round(rating);
    if (roundedRating >= 1 && roundedRating <= 5) {
      ratingDistribution[roundedRating]++;
    }
  });

  // Update product with new rating statistics
  await model.ProductModel.findByIdAndUpdate(
    productId,
    {
      $set: {
        averageRating: parseFloat(result.averageRating.toFixed(1)),
        totalRatings: result.totalRatings,
        ratingCounts: ratingDistribution,
      },
    },
    { new: true }
  );
};

const rateProductWithComment = asyncHandler(async (req) => {
  const { productId, rating, comment } = req.body;

  if (!rating || rating < 0 || rating > 5) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rating must be between 0 and 5");
  }

  const product = await model.ProductModel.findById(new mongoose.Types.ObjectId(productId));

  if (!product)
    throw new ApiError(StatusCodes.NOT_FOUND, `product with Id: ${productId} not exist`);

  // Check if user has already rated this product
  const existingRating = await model.RatingModel.findOne({
    productId: product._id,
    userId: req?.user?._id,
  });

  let ratingResult;

  if (existingRating) {
    // Update existing rating
    ratingResult = await model.RatingModel.findByIdAndUpdate(
      existingRating._id,
      {
        $set: {
          rate: rating,
          comment: comment,
          userId: req?.user?._id,
        },
      },
      { new: true }
    );

    // Emit socket event for rating update
    // if (product.userId) {
    //   emitSocketEventToUser(req, product.userId.toString(), PRODUCT_RATING_UPDATED, ratingResult);
    // }
  } else {
    // Create new rating
    ratingResult = await model.RatingModel.create({
      rate: rating,
      productId: product._id,
      userId: req?.user?._id,
      comment,
    });

    // Emit socket event for new rating with comment
    // if (product.userId) {
    //   emitSocketEventToUser(product.userId.toString(), PRODUCT_RATING_WITH_COMMENT, ratingResult);
    // }
  }

  // Update product's overall rating statistics
  await updateProductRatingStats(productId);

  return new ApiResponse(
    StatusCodes.OK,
    existingRating ? "Rating updated successfully" : "Product rated successfully",
    ratingResult
  );
});

const rateProductWithoutComment = asyncHandler(async (req, res) => {
  const { productId, rating } = req.body;

  if (!rating || rating < 0 || rating > 5) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Rating must be between 0 and 5");
  }

  const product = await model.ProductModel.findById(new mongoose.Types.ObjectId(productId));

  if (!product)
    throw new ApiError(StatusCodes.NOT_FOUND, `product with Id: ${productId} not exist`);

  // Check if user has already rated this product
  const existingRating = await model.RatingModel.findOne({
    productId: product._id,
    userId: req?.user?._id,
  });

  let ratingResult;

  if (existingRating) {
    // Update existing rating
    ratingResult = await model.RatingModel.findByIdAndUpdate(
      existingRating._id,
      {
        $set: {
          rate: rating,
          comment: existingRating.comment, // Preserve any existing comment
        },
      },
      { new: true }
    );

    // Emit socket event for rating update
    // if (product.userId) {
    //   emitSocketEventToUser(product.userId.toString(), PRODUCT_RATING_UPDATED, ratingResult);
    // }
  } else {
    // Create new rating
    ratingResult = await model.RatingModel.create({
      rate: rating,
      productId: product._id,
      userId: req?.user?._id,
    });

    // Emit socket event for new rating without comment
    // if (product.userId) {
    //   emitSocketEventToUser(
    //     product.userId.toString(),
    //     PRODUCT_RATING_WITHOUT_COMMENT,
    //     ratingResult
    //   );
    // }
  }

  // Check if user has purchased this product
  try {
    const hasPurchased = await model.OrderModel.exists({
      userId,
      "items.productId": product._id,
      status: "COMPLETED", // Or whatever status indicates a completed order
    });

    if (hasPurchased) {
      ratingResult.isVerifiedPurchase = true;
      await ratingResult.save();
    }
  } catch (error) {
    // Just log the error but don't stop the process
    console.error("Error checking purchase status:", error);
  }

  // Update product's overall rating statistics
  await updateProductRatingStats(productId);

  return new ApiResponse(
    StatusCodes.OK,
    existingRating ? "Rating updated successfully" : "Product rated successfully",
    ratingResult
  );
});

/**
 * Get all ratings for a product
 */
const getProductRatings = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = "newest", verified = "all" } = req.query;

  const product = await model.ProductModel.findById(new mongoose.Types.ObjectId(productId));

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, `Product with ID: ${productId} does not exist`);
  }

  // Build query
  const query = { productId: product._id };

  // Filter for verified purchases if specified
  if (verified === "verified") {
    query.isVerifiedPurchase = true;
  } else if (verified === "unverified") {
    query.isVerifiedPurchase = false;
  }

  // Calculate pagination
  const paginationOptions = getMognogoosePagination({
    page,
    limit,
  });

  // Determine sort options
  let sortOptions = {};
  switch (sort) {
    case "highest":
      sortOptions = { rate: -1 };
      break;
    case "lowest":
      sortOptions = { rate: 1 };
      break;
    case "oldest":
      sortOptions = { createdAt: 1 };
      break;
    case "newest":
    default:
      sortOptions = { createdAt: -1 };
  }

  // Fetch ratings with pagination
  const ratings = await model.RatingModel.find(query)
    .sort(sortOptions)
    .populate("userId", "name avatar") // Add fields you want from the user
    .skip(paginationOptions.skip)
    .limit(paginationOptions.limit);

  // Get total count for pagination
  const totalRatings = await model.RatingModel.countDocuments(query);

  // Get rating summary
  const ratingSummary = {
    averageRating: product.averageRating || 0,
    totalRatings: product.totalRatings || 0,
    distribution: product.ratingCounts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  return new ApiResponse(StatusCodes.OK, "Product ratings retrieved", {
    ratings,
    summary: ratingSummary,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalRatings / parseInt(limit)),
      totalItems: totalRatings,
      hasNextPage: parseInt(page) < Math.ceil(totalRatings / parseInt(limit)),
    },
  });
});

/**
 * Delete a rating
 */
const deleteRating = asyncHandler(async (req, res) => {
  const { ratingId } = req.params;
  const userId = req.user._id;

  const rating = await model.RatingModel.findById(ratingId);

  if (!rating) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Rating not found");
  }

  // Check if user owns this rating or is an admin
  if (rating.userId.toString() !== userId.toString() && req.user.role !== "admin") {
    throw new ApiError(StatusCodes.FORBIDDEN, "You don't have permission to delete this rating");
  }

  await model.RatingModel.findByIdAndDelete(ratingId);

  // Update product's rating statistics
  await updateProductRatingStats(rating.productId);

  return new ApiResponse(StatusCodes.OK, "Rating deleted successfully", null);
});

module.exports = {
  rateProductWithComment,
  rateProductWithoutComment,
  getProductRatings,
  deleteRating,
};
