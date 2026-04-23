import cartModel from "../../DB/models/cart.model.js";
import orderModel from "../../DB/models/order.model.js";
import * as db_service from "../../DB/db.service.js";
import { successResponse } from "../../common/utils/response.success.js";
import { stripe } from "../../common/stripe/stripe.js";
import { paymentMethod, status } from "../../common/enum/order.enum.js";

const clearCart = async (cart) => {
  cart.products = [];
  cart.totalPrice = 0;
  await cart.save();
};

const generateOrderNumber = async () => {
  const lastOrder = await db_service.findOne({
    model: orderModel,
    sort: { createdAt: -1 },
    select: "orderNumber",
  });
  return (lastOrder?.orderNumber || 1000) + 1;
};

export const createOrder = async (req, res) => {
  const userId = req.user._id;
  const {
    address,
    phone,
    paymentMethod: method = paymentMethod.cash,
  } = req.body;

  if (!address || !phone) {
    throw new Error("Address and phone required", { cause: 400 });
  }

  const cart = await db_service.findOne({
    model: cartModel,
    filter: { user: userId },
    populate: [{ path: "products.product", select: "name" }],
  });

  if (!cart || cart.products.length === 0) {
    throw new Error("Cart is empty", { cause: 400 });
  }

  const finalPrice =
    cart.couponCode && cart.discountedPrice > 0
      ? cart.discountedPrice
      : cart.totalPrice;

  const mappedProducts = cart.products.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.price,
    name: item.product.name,
  }));

  if (method === paymentMethod.cash) {
    const orderNumber = await generateOrderNumber();

    const order = await db_service.create({
      model: orderModel,
      data: {
        orderNumber,
        user: userId,
        products: mappedProducts,
        totalPrice: finalPrice,
        address,
        phone,
        paymentMethod: paymentMethod.cash,
        couponCode: cart.couponCode || null,
      },
    });

    await clearCart(cart);
    return successResponse({ res, data: order, status: 201 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: [paymentMethod.card],
    mode: "payment",
    line_items: cart.products.map((item) => ({
      price_data: {
        currency: "egp",
        product_data: { name: item.product.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    })),
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
    metadata: {
      userId: userId.toString(),
      address,
      phone,
      finalPrice: finalPrice.toString(),
      couponCode: cart.couponCode || "",
    },
  });

  successResponse({ res, data: { url: session.url } });
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return res.status(400).send("Webhook Error");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const existingOrder = await db_service.findOne({
      model: orderModel,
      filter: { stripeSessionId: session.id },
    });

    if (existingOrder) return res.json({ received: true });

    const { userId, address, phone } = session.metadata;

    const cart = await db_service.findOne({
      model: cartModel,
      filter: { user: userId },
      populate: [{ path: "products.product", select: "name" }],
    });

    if (!cart || cart.products.length === 0)
      return res.json({ received: true });

    const orderNumber = await generateOrderNumber();

    await db_service.create({
      model: orderModel,
      data: {
        orderNumber,
        user: userId,
        products: cart.products.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          name: item.product.name,
        })),
        totalPrice: parseFloat(session.metadata.finalPrice) || cart.totalPrice,
        couponCode: session.metadata.couponCode || null,
        address,
        phone,
        paymentMethod: paymentMethod.card,
        isPaid: true,
        stripeSessionId: session.id,
      },
    });

    await clearCart(cart);
  }

  res.status(200).json({ received: true });
};

export const cancelOrder = async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;

  const order = await db_service.findOne({
    model: orderModel,
    filter: { _id: orderId, user: userId },
  });

  if (!order) {
    throw new Error("Order not found", { cause: 404 });
  }

  if (![status.pending, status.confirmed].includes(order.status)) {
    throw new Error("Cannot cancel this order", { cause: 400 });
  }

  order.status = status.cancelled;
  await order.save();

  successResponse({ res, message: "Order cancelled" });
};

export const getUserOrders = async (req, res) => {
  const orders = await db_service.find({
    model: orderModel,
    filter: { user: req.user._id },
    options: { sort: { createdAt: -1 } },
  });

  successResponse({ res, data: orders });
};

export const autoConfirmOrders = async () => {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  await db_service.updateMany({
    model: orderModel,
    filter: { status: status.pending, createdAt: { $lte: sixHoursAgo } },
    update: { status: status.confirmed, confirmedAt: new Date() },
  });
};

export const autoShipOrders = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await db_service.updateMany({
    model: orderModel,
    filter: { status: status.confirmed, confirmedAt: { $lte: oneDayAgo } },
    update: { status: status.shipped, shippedAt: new Date() },
  });
};
