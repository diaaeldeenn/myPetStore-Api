import Joi from "joi";


export const addToWishlistSchema = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "ProductId is required",
  }),
});

export const removeFromWishlistSchema = Joi.object({
  productId: Joi.string().required(),
});