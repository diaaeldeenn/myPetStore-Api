import { Router } from "express";
import { authentication } from "../../common/middleware/auth.js";
import * as WL from "./wishlist.service.js";


const wishlistRouter = Router();

wishlistRouter.post("/", authentication, WL.addToWishlist);
wishlistRouter.delete("/:productId", authentication, WL.removeFromWishlist);
wishlistRouter.get("/", authentication,WL.getWishlist);
wishlistRouter.delete("/wishlist", authentication, WL.clearWishlist);

export default wishlistRouter;