import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
  },
  { timestamps: true },
);

//Repeate Same Product To Same User Is DisAllowed!
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

export const wishlistModel = mongoose.model("wishlist", wishlistSchema);
