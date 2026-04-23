import couponModel from "../../DB/models/coupon.model.js";
import cartModel from "../../DB/models/cart.model.js";
import * as db_service from "../../DB/db.service.js";
import { successResponse } from "../../common/utils/response.success.js";

export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, expiresAt, maxUsage } = req.body;

  const existing = await db_service.findOne({
    model: couponModel,
    filter: { code: code.toUpperCase() },
  });

  if (existing) {
    throw new Error("Coupon code already exists", { cause: 409 });
  }

  const coupon = await db_service.create({
    model: couponModel,
    data: { code, discountType, discountValue, expiresAt, maxUsage },
  });

  successResponse({ res, status: 201, data: coupon });
};

export const applyCoupon = async (req, res) => {
  const userId = req.user._id;
  const { code } = req.body;

  const coupon = await db_service.findOne({
    model: couponModel,
    filter: { code: code.toUpperCase() },
  });

  if (!coupon) {
    throw new Error("Coupon not found", { cause: 404 });
  }

  if (new Date() > new Date(coupon.expiresAt)) {
    throw new Error("Coupon has expired", { cause: 400 });
  }

  if (coupon.usedBy.length >= coupon.maxUsage) {
    throw new Error("Coupon has reached its maximum usage limit", {
      cause: 400,
    });
  }

  const alreadyUsed = coupon.usedBy.some(
    (id) => id.toString() === userId.toString(),
  );

  if (alreadyUsed) {
    throw new Error("You have already used this coupon", { cause: 400 });
  }

  const cart = await db_service.findOne({
    model: cartModel,
    filter: { user: userId },
  });

  if (!cart || cart.products.length === 0) {
    throw new Error("Cart is empty", { cause: 400 });
  }

  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = (cart.totalPrice * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  const discountedPrice = parseFloat(
    Math.max(0, cart.totalPrice - discountAmount).toFixed(2),
  );

  cart.couponCode = coupon.code;
  cart.discountAmount = parseFloat(discountAmount.toFixed(2));
  cart.discountedPrice = discountedPrice;

  coupon.usedBy.push(userId);

  await cart.save();
  await coupon.save();

  successResponse({
    res,
    message: "Coupon applied successfully",
    data: {
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      originalPrice: cart.totalPrice,
      discountAmount: cart.discountAmount,
      discountedPrice: cart.discountedPrice,
    },
  });
};

export const removeCoupon = async (req, res) => {
  const userId = req.user._id;

  const cart = await db_service.findOne({
    model: cartModel,
    filter: { user: userId },
  });

  if (!cart) {
    throw new Error("Cart not found", { cause: 404 });
  }

  if (!cart.couponCode) {
    throw new Error("No coupon applied on this cart", { cause: 400 });
  }

  const coupon = await db_service.findOne({
    model: couponModel,
    filter: { code: cart.couponCode },
  });

  if (coupon) {
    coupon.usedBy = coupon.usedBy.filter(
      (id) => id.toString() !== userId.toString(),
    );
    await coupon.save();
  }
  cart.couponCode = null;
  cart.discountAmount = 0;
  cart.discountedPrice = 0;

  await cart.save();

  successResponse({ res, message: "Coupon removed successfully" });
};
