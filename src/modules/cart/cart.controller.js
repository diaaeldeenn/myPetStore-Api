import { Router } from "express";
import { authentication } from "../../common/middleware/auth.js";
import * as CS from "./cart.service.js";
import { schema } from "../../common/middleware/schema.js";
import { addToCartSchema, removeFromCartSchema, updateCartSchema } from "../../common/middleware/schema/cart.schema.js";


const cartRouter = Router();

cartRouter.post("/", authentication,schema(addToCartSchema), CS.addToCart);
cartRouter.patch("/", authentication,schema(updateCartSchema),CS.updateCartQuantity);
cartRouter.delete("/:productId", authentication,schema(removeFromCartSchema),CS.removeFromCart);
cartRouter.delete("/", authentication, CS.clearCart);
cartRouter.get("/", authentication, CS.getCart);

export default cartRouter;
