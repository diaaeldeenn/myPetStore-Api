import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    totalPrice: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    discountedPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const cartModel = mongoose.models.cart || mongoose.model("cart", cartSchema);

export default cartModel;
