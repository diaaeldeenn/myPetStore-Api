import { Router } from "express";
import * as PD from "./product.service.js";
import { localMulter } from "../../common/middleware/multer.js";
import { multerTypeEnum } from "../../common/enum/multer.enum.js";

const productRouter = Router();
productRouter.get("/",PD.getProducts);
productRouter.get("/:productId",PD.getSpeceficProduct);
productRouter.post("/",localMulter({fileExt:multerTypeEnum.image}).single("image"),PD.addProduct);


export default productRouter;