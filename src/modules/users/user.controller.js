import { Router } from "express";
import * as US from "./user.service.js";
import { authentication } from "../../common/middleware/auth.js";
import { schema } from "../../common/middleware/schema.js";
import { signInSchema, signUpSchema } from "../../common/middleware/schema/auth.schema.js";

const userRouter = Router();

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *               - rePassword
 *               - age
 *             properties:
 *               userName:
 *                 type: string
 *                 example: Diaa Eldeen
 *               email:
 *                 type: string
 *                 example: diaa@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *               rePassword:
 *                 type: string
 *                 example: 12345678
 *               age:
 *                 type: number
 *                 example: 23
 *               phone:
 *                 type: string
 *                 example: 01278396490
 *               gender:
 *                 type: string
 *                 example: male
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 *       422:
 *         description: Validation error
 */
userRouter.post("/signup", schema(signUpSchema), US.signUp);

/**
 * @swagger
 * /users/signin:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: diaa@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Login successfully
 *       400:
 *         description: Invalid password
 *       409:
 *         description: User not exist
 */
userRouter.post("/signin", schema(signInSchema), US.signIn);

export default userRouter;