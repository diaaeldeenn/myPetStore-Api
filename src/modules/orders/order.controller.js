import { Router } from "express";
import { authentication } from "../../common/middleware/auth.js";
import * as OD from "./order.service.js";
import { schema } from "../../common/middleware/schema.js";
import { createOrderSchema } from "../../common/middleware/schema/order.schema.js";

const orderRouter = Router();

orderRouter.post("/", authentication,schema(createOrderSchema),OD.createOrder);
orderRouter.get("/", authentication, OD.getUserOrders);
orderRouter.patch("/:orderId/cancel", authentication, OD.cancelOrder);

export default orderRouter;