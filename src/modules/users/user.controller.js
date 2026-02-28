import { Router } from "express";
import * as US from "./user.service.js";
import { authentication } from "../../common/middleware/auth.js";
import { schema } from "../../common/middleware/schema.js";
import { signInSchema, signUpSchema } from "../../common/middleware/schema/auth.schema.js";

const userRouter = Router();

userRouter.post("/signup",schema(signUpSchema),US.signUp);
userRouter.post("/signin",schema(signInSchema),US.signIn);

export default userRouter;