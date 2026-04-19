import { Router } from "express";
import { authentication } from "../../common/middleware/auth.js";
import * as WL from "./wishlist.service.js";
import { schema } from "../../common/middleware/schema.js";
import { addToWishlistSchema, removeFromWishlistSchema } from "../../common/middleware/schema/wishlist.schema.js";


const wishlistRouter = Router();

wishlistRouter.post("/", authentication,schema(addToWishlistSchema),WL.addToWishlist);
wishlistRouter.delete("/", authentication, WL.clearWishlist);
wishlistRouter.delete("/:productId", authentication,schema(removeFromWishlistSchema),WL.removeFromWishlist);
wishlistRouter.get("/", authentication,WL.getWishlist);

export default wishlistRouter;