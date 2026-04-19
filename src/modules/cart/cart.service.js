import cartModel from "../../DB/models/cart.model.js";
import productModel from "../../DB/models/product.model.js";
import * as db_service from "../../DB/db.service.js";
import { successResponse } from "../../common/utils/response.success.js";
import { calculateTotalPrice } from "../../common/utils/total.price.js";

export const addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    throw new Error("ProductId is required", { cause: 400 });
  }

  const product = await db_service.findById({
    model: productModel,
    id: productId,
  });

  if (!product) {
    throw new Error("Product not found", { cause: 404 });
  }

  let cart = await db_service.findOne({
    model: cartModel,
    filter: { user: userId },
  });

  if (!cart) {
    cart = await db_service.create({
      model: cartModel,
      data: {
        user: userId,
        products: [
          {
            product: productId,
            quantity,
            price: product.price,
          },
        ],
        totalPrice: product.price * quantity,
      },
    });
  } else {
    const item = cart.products.find((p) => p.product.toString() === productId);

    if (item) {
      item.quantity += quantity;
    } else {
      cart.products.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    cart.totalPrice = calculateTotalPrice(cart.products);

    await cart.save();
  }

  successResponse({ res, data: cart });
};

export const updateCartQuantity = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  const cart = await db_service.findOne({
    model: cartModel,
    filter: { user: userId },
  });

  if (!cart) {
    throw new Error("Cart not found", { cause: 404 });
  }

  const index = cart.products.findIndex(
    (p) => p.product.toString() === productId,
  );

  if (index === -1) {
    throw new Error("Product not in cart", { cause: 404 });
  }

  if (quantity <= 0) {
    cart.products.splice(index, 1);
  } else {
    cart.products[index].quantity = quantity;
  }

  cart.totalPrice = calculateTotalPrice(cart.products);

  await cart.save();

  successResponse({ res, data: cart });
};

export const removeFromCart = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const cart = await db_service.findOne({
    model: cartModel,
    filter: { user: userId },
  });

  if (!cart) {
    throw new Error("Cart not found", { cause: 404 });
  }

  const initialLength = cart.products.length;

  cart.products = cart.products.filter(
    (p) => p.product.toString() !== productId,
  );

  if (cart.products.length === initialLength) {
    throw new Error("Product not found in cart", { cause: 404 });
  }

  cart.totalPrice = calculateTotalPrice(cart.products);

  await cart.save();

  successResponse({ res, message: "Product removed" });
};

export const clearCart = async (req, res) => {
  const userId = req.user._id;

  const cart = await db_service.findOne({
    model: cartModel,
    filter: { user: userId },
  });

  if (!cart) {
    throw new Error("Cart not found", { cause: 404 });
  }

  cart.products = [];
  cart.totalPrice = 0;

  await cart.save();

  successResponse({ res, message: "Cart cleared" });
};

export const getCart = async (req, res) => {
  const userId = req.user._id;

  const cart = await db_service.findOne({
    model: cartModel,
    filter: { user: userId },
  });

  if (!cart) {
    return successResponse({
      res,
      message: "Cart Is Empty !",
      data: {
        products: [],
        totalPrice: 0,
      },
    });
  }

  successResponse({ res, data: cart });
};
