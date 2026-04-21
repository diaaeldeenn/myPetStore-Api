import mongoose from "mongoose";
import { paymentMethod, status } from "../../common/enum/order.enum.js";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        quantity: Number,
        price: Number,
        name: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(paymentMethod),
      default: paymentMethod.cash,
    },
    status: {
      type: String,
      enum: Object.values(status),
      default: status.pending,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    confirmedAt: Date,
    shippedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.models.order || mongoose.model("order", orderSchema);
