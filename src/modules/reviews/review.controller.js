import { Router } from "express";
import { authentication } from "../../common/middleware/auth.js";
import * as reviewService from "./review.service.js";
import { schema } from "../../common/middleware/schema.js";
import { addReviewSchema, updateReviewSchema } from "../../common/middleware/schema/review.schema.js";


const reviewRouter = Router({ mergeParams: true });

reviewRouter.get("/", reviewService.getReviews);
reviewRouter.post("/", authentication,schema(addReviewSchema),reviewService.addReview);
reviewRouter.patch("/:reviewId", authentication,schema(updateReviewSchema),reviewService.updateReview);
reviewRouter.delete("/:reviewId", authentication, reviewService.deleteReview);

export default reviewRouter;