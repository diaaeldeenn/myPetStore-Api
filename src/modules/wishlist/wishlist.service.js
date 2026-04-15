import { successResponse } from "../../common/utils/response.success.js";
import * as db_service from "../../DB/db.service.js";
import { wishlistModel } from "../../DB/models/wishlist.model.js";
import productModel from "../../DB/models/product.model.js";

export const addToWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId) {
    throw new Error("ProductId is required", { cause: 400 });
  }

  try {
    const item = await db_service.create({
      model: wishlistModel,
      data: { user: userId, product: productId },
    });

    successResponse({
      res,
      message: "Added to wishlist",
      data: item,
      status: 201,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("Product already in wishlist", { cause: 400 });
    }

    const product = await db_service.findById({
      model: productModel,
      id: productId,
    });

    if (!product) {
      throw new Error("Product not found", { cause: 404 });
    }

    throw new Error("Server Error", { cause: 500 });
  }
};

export const removeFromWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const deletedItem = await db_service.findOneAndDelete({
    model: wishlistModel,
    filter: { user: userId, product: productId },
  });

  if (!deletedItem) {
    throw new Error("Item not found in wishlist", { cause: 404 });
  }
  successResponse({
    res,
    message: "Removed from wishlist",
  });
};

export const getWishlist = async (req, res) => {
  const userId = req.user._id;
  const wishlistData = await db_service.find({
    model: wishlistModel,
    filter: { user: userId },
    options: {
      populate: "product",
      sort: { createdAt: -1 },
    },
  });
  successResponse({
    res,
    data: {
      count: wishlistData.length,
      wishlist: wishlistData,
    },
  });
};
