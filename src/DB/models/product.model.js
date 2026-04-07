import mongoose from "mongoose";
import { productCategoryEnum } from "../../common/enum/product.enum.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    slug: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    description: {
      type: String,
      required: true,
      minLength: 5,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(productCategoryEnum),
      required: true,
    },
    weight: {
      type: {
        value: { type: Number, required: true },
        unit: { type: String, required: true },
      },
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: false,
    strictQuery: true,
  },
);

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
