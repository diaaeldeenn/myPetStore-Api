import Joi from "joi";

export const addReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    "number.base": "Rating must be a number",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating must be at most 5",
    "any.required": "Rating is required",
  }),
  comment: Joi.string().min(3).required().messages({
    "string.base": "Comment must be a string",
    "string.min": "Comment must be at least 3 characters",
    "any.required": "Comment is required",
  }),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).messages({
    "number.base": "Rating must be a number",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating must be at most 5",
  }),
  comment: Joi.string().min(3).messages({
    "string.base": "Comment must be a string",
    "string.min": "Comment must be at least 3 characters",
  }),
})
  .or("rating", "comment")
  .messages({
    "object.missing": "You must provide at least rating or comment",
  });
