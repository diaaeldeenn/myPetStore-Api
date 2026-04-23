import { Router } from "express";
import { authentication } from "../../common/middleware/auth.js";
import { schema } from "../../common/middleware/schema.js";
import * as CS from "./coupon.service.js";
import {
  applyCouponSchema,
  createCouponSchema,
} from "../../common/middleware/schema/coupon.schema.js";

const couponRouter = Router();

couponRouter.post("/", schema(createCouponSchema), CS.createCoupon);
couponRouter.post("/apply", authentication, schema(applyCouponSchema), CS.applyCoupon);
couponRouter.delete("/remove", authentication, CS.removeCoupon);

export default couponRouter;