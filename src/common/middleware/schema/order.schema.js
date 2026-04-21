import Joi from "joi";

export const createOrderSchema = Joi.object({
  address: Joi.string().min(5).max(100).required().messages({
    "string.min": "Address must be at least 5 characters",
    "string.max": "Address must be at most 100 characters",
    "any.required": "Address is required",
  }),
  phone: Joi.string()
    .pattern(/^01[0125][0-9]{8}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be a valid Egyptian number",
      "any.required": "Phone is required",
    }),
  paymentMethod: Joi.string().valid("cash", "card").default("cash").messages({
    "any.only": "Payment method must be cash or card",
  }),
});
