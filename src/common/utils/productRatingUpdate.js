import * as db_service from "../../DB/db.service.js";
import productModel from "../../DB/models/product.model.js";
import reviewModel from "../../DB/models/review.model.js";

export const updateProductRating = async (productId) => {
  const reviews = await db_service.find({
    model: reviewModel,
    filter: { product: productId },
  });
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  await db_service.findOneAndUpdate({
    model: productModel,
    filter: { _id: productId },
    update: { rating: avgRating.toFixed(1) },
  });
};
