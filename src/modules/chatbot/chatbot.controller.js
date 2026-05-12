import { Router } from "express";
import * as CB from "./chatbot.service.js";
import { schema } from "../../common/middleware/schema.js";
import { chatbotMessageSchema } from "../../common/middleware/schema/chatbot.schema.js";



const chatbotRouter = Router();

chatbotRouter.post("/message",schema(chatbotMessageSchema),CB.chatbotMessage);


export default chatbotRouter;
