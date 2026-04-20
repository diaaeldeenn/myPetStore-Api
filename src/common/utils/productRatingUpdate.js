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