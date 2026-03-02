import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config.js";
import express from "express";
import connectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors";

const app = express();

app.use(async (req, res, next) => {
  await connectionDB();
  next();
});

app.use(cors(), express.json());
app.use("/api-docs", swaggerUi.serve);
app.get(
  "/api-docs",
  swaggerUi.setup(swaggerSpec)
);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome In My Api" });
});
app.use("/users", userRouter);
app.use("{/*demo}", (req, res) => {
  throw new Error(`Url ${req.originalUrl} Not Found!`, { cause: 404 });
});
app.use((err, req, res, next) => {
  res.status(err.cause || 500).json({ message: err.message, stack: err.stack });
});

export default app;