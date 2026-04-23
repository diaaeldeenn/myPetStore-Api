import Joi from "joi";

export const createCouponSchema = Joi.object({
  code: Joi.string().min(3).max(30).required().messages({
    "string.min": "Coupon code must be at least 3 characters",
    "string.max": "Coupon code must be at most 30 characters",
    "any.required": "Coupon code is required",
  }),

  discountType: Joi.string().valid("percentage", "fixed").required().messages({
    "any.only": "Discount type must be percentage or fixed",
    "any.required": "Discount type is required",
  }),

  discountValue: Joi.number().min(0).required().messages({
    "number.base": "Discount value must be a number",
    "number.min": "Discount value must be at least 0",
    "any.required": "Discount value is required",
  }),

  expiresAt: Joi.date().greater("now").required().messages({
    "date.greater": "Expiry date must be in the future",
    "any.required": "Expiry date is required",
  }),

  maxUsage: Joi.number().integer().min(1).required().messages({
    "number.base": "Max usage must be a number",
    "number.min": "Max usage must be at least 1",
    "any.required": "Max usage is required",
  }),
});

export const applyCouponSchema = Joi.object({
  code: Joi.string().required().messages({
    "any.required": "Coupon code is required",
    "string.empty": "Coupon code cannot be empty",
  }),
});