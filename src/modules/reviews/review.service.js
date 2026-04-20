import reviewModel from "../../DB/models/review.model.js";
import productModel from "../../DB/models/product.model.js";
import * as db_service from "../../DB/db.service.js";
import { successResponse } from "../../common/utils/response.success.js";
import { updateProductRating } from "../../common/utils/productRatingUpdate.js";


export const getReviews = async (req, res) => {
  const { productId } = req.params;
  try {
    const reviews = await db_service.find({
      model: reviewModel,
      filter: { product: productId },
      options: {
        populate: { path: "user", select: "firstName lastName gender" },
        sort: { createdAt: -1 },
      },
    });
    successResponse({ res, data: reviews });
  } catch (error) {
    throw new Error(error, { cause: 500 });
  }
};



export const addReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;
  try {
    const product = await db_service.findById({ model: productModel, id: productId });
    if (!product) throw new Error("Product not found", { cause: 404 });

    const existing = await db_service.findOne({
      model: reviewModel,
      filter: { user: userId, product: productId },
    });
    if (existing) throw new Error("You already reviewed this product", { cause: 400 });

    const review = await db_service.create({
      model: reviewModel,
      data: { user: userId, product: productId, rating, comment },
    });

    await updateProductRating(productId);

    successResponse({ res, status: 201, data: review });
  } catch (error) {
    throw new Error(error, { cause: 500 });
  }
};


export const updateReview = async (req, res) => {
  const { productId, reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;
  try {
    const review = await db_service.findOneAndUpdate({
      model: reviewModel,
      filter: { _id: reviewId, product: productId, user: userId },
      update: {
        ...(rating && { rating }),
        ...(comment && { comment }),
      },
    });
    if (!review) throw new Error("Review not found or not authorized", { cause: 404 });

    await updateProductRating(productId);

    successResponse({ res, data: review });
  } catch (error) {
    throw new Error(error, { cause: 500 });
  }
};


export const deleteReview = async (req, res) => {
  const { productId, reviewId } = req.params;
  const userId = req.user._id;
  try {
    const review = await db_service.findOneAndDelete({
      model: reviewModel,
      filter: { _id: reviewId, product: productId, user: userId },
    });
    if (!review) throw new Error("Review not found or not authorized", { cause: 404 });

    await updateProductRating(productId);

    successResponse({ res, message: "Review deleted successfully" });
  } catch (error) {
    throw new Error(error, { cause: 500 });
  }
};