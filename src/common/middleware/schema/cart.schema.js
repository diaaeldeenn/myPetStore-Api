import Joi from "joi";

export const addToCartSchema = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "ProductId is required",
    "string.empty": "ProductId cannot be empty",
  }),

  quantity: Joi.number().min(1).default(1).messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be at least 1",
  }),
});


export const updateCartSchema = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "ProductId is required",
  }),

  quantity: Joi.number().required().messages({
    "any.required": "Quantity is required",
    "number.base": "Quantity must be a number",
  }),
});


export const removeFromCartSchema = Joi.object({
  productId: Joi.string().required(),
});