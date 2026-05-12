import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    keywords: {
      type: [String],
      required: true,
      default: [],
      index: true,
    },
    category: {
      type: String,
      default: "general",
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
  },
);

faqSchema.index({ question: "text", answer: "text", keywords: "text", category: "text" });

const faqModel = mongoose.models.faq || mongoose.model("faq", faqSchema);

export default faqModel;
