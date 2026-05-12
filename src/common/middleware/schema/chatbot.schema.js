import Joi from "joi";

export const chatbotMessageSchema = Joi.object({
  message: Joi.string().trim().min(1).max(1000).required(),
});