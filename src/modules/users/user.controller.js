import { Router } from "express";
import * as US from "./user.service.js";
import { authentication } from "../../common/middleware/auth.js";
import { schema } from "../../common/middleware/schema.js";
import { addAddressSchema, confirmEmailSchema, emailSchema, resetPasswordSchema, signInSchema, signUpSchema, updateAddressSchema, updatePasswordSchema, updateProfileSchema } from "../../common/middleware/schema/auth.schema.js";

const userRouter = Router();

userRouter.post("/signup", schema(signUpSchema), US.signUp);
userRouter.post("/signin", schema(signInSchema), US.signIn);
userRouter.get("/profile",authentication,US.getProfile);
userRouter.patch("/updateProfile",authentication,schema(updateProfileSchema),US.updateProfile);
userRouter.patch("/updatePassword",authentication,schema(updatePasswordSchema),US.updatePassword);
userRouter.patch("/forgetPassword",schema(emailSchema),US.forgetPassword);
userRouter.post("/confirmPassword",schema(confirmEmailSchema),US.confirmPassword);
userRouter.patch("/resetPassword",schema(resetPasswordSchema),US.resetPassword);
userRouter.post("/address", authentication,schema(addAddressSchema),US.addAddress);
userRouter.get("/address", authentication, US.getAddress);
userRouter.delete("/address/:addressId", authentication, US.removeAddress);
userRouter.patch("/address/:addressId", authentication,schema(updateAddressSchema),US.updateAddress);

export default userRouter;