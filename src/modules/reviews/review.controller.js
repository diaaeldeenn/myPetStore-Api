import { Router } from "express";
import { authentication } from "../../common/middleware/auth.js";
import * as reviewService from "./review.service.js";

const reviewRouter = Router({ mergeParams: true });

reviewRouter.get("/", reviewService.getReviews);
reviewRouter.post("/", authentication, reviewService.addReview);
reviewRouter.patch("/:reviewId", authentication, reviewService.updateReview);
reviewRouter.delete("/:reviewId", authentication, reviewService.deleteReview);

export default reviewRouter;