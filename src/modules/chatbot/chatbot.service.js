import natural from "natural";
import faqModel from "../../DB/models/faq.model.js";
import productModel from "../../DB/models/product.model.js";
import orderModel from "../../DB/models/order.model.js";
import { wishlistModel } from "../../DB/models/wishlist.model.js";
import { successResponse } from "../../common/utils/response.success.js";

const arabicMap = {
  أ: "ا",
  إ: "ا",
  آ: "ا",
  ٱ: "ا",
  ى: "ي",
  ة: "ه",
  ؤ: "و",
  ئ: "ي",
};

export const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[أإآٱىةؤئ]/g, (c) => arabicMap[c] || c)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenizer = new natural.WordTokenizer();

const INTENTS = {
  price: [
    "سعر",
    "بكام",
    "بكم",
    "كام",
    "كم",
    "ثمن",
    "تكلفة",
    "price",
    "cost",
    "how much",
  ],
  availability: [
    "موجود",
    "عندكم",
    "عندك",
    "متاح",
    "فيه",
    "هل يوجد",
    "هل في",
    "available",
    "in stock",
    "do you have",
  ],
  category: [
    "قطط",
    "كلاب",
    "طيور",
    "سمك",
    "ارانب",
    "قوارض",
    "cats",
    "dogs",
    "birds",
    "fish",
    "rabbits",
  ],
  orders: [
    "اوردر",
    "اوردراتي",
    "طلباتي",
    "طلبي",
    "orders",
    "my orders",
    "حالة طلب",
    "اوردرات",
  ],
  wishlist: [
    "wishlist",
    "المفضلة",
    "المفضله",
    "قائمة امنياتي",
    "اللي حفظته",
    "المحفوظ",
  ],
  coupon: ["كوبون", "كود خصم", "كوبون خصم", "coupon", "discount code", "promo"],
};

const detectIntent = (normalized) => {
  let bestIntent = "faq";
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENTS)) {
    let currentScore = 0;

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (normalized.includes(normalizedKeyword)) {
        currentScore += 3;
        continue;
      }

      const similarity = natural.JaroWinklerDistance(
        normalized,
        normalizedKeyword,
      );

      if (similarity >= 0.88) {
        currentScore += similarity * 2;
      }
    }

    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestIntent = intent;
    }
  }

  return bestIntent;
};

const STOP_WORDS = new Set([
  "سعر",
  "بكام",
  "بكم",
  "كام",
  "كم",
  "ثمن",
  "تكلفة",
  "موجود",
  "عندكم",
  "عندك",
  "متاح",
  "فيه",
  "هل",
  "يوجد",
  "ما",
  "هو",
  "هي",
  "في",
  "من",
  "على",
  "عن",
  "انا",
  "اريد",
  "عايز",
  "عايزة",
  "ممكن",
  "لو",
  "فضلك",
  "please",
  "the",
  "a",
  "an",
  "what",
  "is",
  "are",
  "for",
  "of",
  "can",
  "i",
  "get",
  "me",
]);

const extractProductName = (normalized) =>
  tokenizer
    .tokenize(normalized)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .join(" ")
    .trim();

const handlePrice = async (normalized) => {
  const searchTerm = extractProductName(normalized);

  if (!searchTerm)
    return {
      answer: "Please mention the product name you want its price for.",
    };

  const products = await productModel
    .find({ name: { $regex: searchTerm, $options: "i" } })
    .select("name price category weight")
    .limit(5)
    .lean();

  if (!products.length)
    return {
      answer: `No product found matching "${searchTerm}". Try another name.`,
    };

  if (products.length === 1) {
    const p = products[0];

    return {
      answer: `🛍️ ${p.name}\n💰 Price: ${p.price} EGP\n📦 Category: ${p.category}`,
      products,
    };
  }

  const list = products.map((p) => `• ${p.name} — ${p.price} EGP`).join("\n");

  return {
    answer: `I found multiple products:\n${list}`,
    products,
  };
};

const handleAvailability = async (normalized) => {
  const searchTerm = extractProductName(normalized);

  if (!searchTerm)
    return { answer: "Please mention the product name you are asking about." };

  const products = await productModel
    .find({ name: { $regex: searchTerm, $options: "i" } })
    .select("name price category image")
    .limit(5)
    .lean();

  if (!products.length)
    return {
      answer: `No available product found matching "${searchTerm}".`,
    };

  if (products.length === 1) {
    const p = products[0];

    return {
      answer: `✅ ${p.name} is available.\n💰 Price: ${p.price} EGP\n📦 Category: ${p.category}`,
      products,
    };
  }

  const list = products.map((p) => `• ${p.name} — ${p.price} EGP`).join("\n");

  return {
    answer: `✅ Available products:\n${list}`,
    products,
  };
};

const handleCategory = async (normalized) => {
  const categoryMap = {
    قطط: "cats",
    كلاب: "dogs",
    طيور: "birds",
    سمك: "fish",
    ارانب: "rabbits",
    قوارض: "rodents",
    cats: "cats",
    dogs: "dogs",
    birds: "birds",
    fish: "fish",
    rabbits: "rabbits",
  };

  let matchedCategory = null;

  for (const [key, val] of Object.entries(categoryMap)) {
    const normalizedKey = normalizeText(key);

    if (
      normalized.includes(normalizedKey) ||
      natural.JaroWinklerDistance(normalized, normalizedKey) >= 0.9
    ) {
      matchedCategory = val;
      break;
    }
  }

  if (!matchedCategory)
    return {
      answer: "Please mention the pet category you are looking for.",
    };

  const products = await productModel
    .find({ category: matchedCategory })
    .select("name price rating")
    .sort({ rating: -1 })
    .limit(5)
    .lean();

  if (!products.length)
    return {
      answer: `No products available right now for ${matchedCategory}.`,
    };

  const list = products
    .map((p) => `• ${p.name} — ${p.price} EGP ⭐ ${p.rating}`)
    .join("\n");

  return {
    answer: `🐾 Top ${matchedCategory} products:\n${list}`,
    products,
  };
};

const handleOrders = async (userId) => {
  if (!userId)
    return {
      answer: "You need to be logged in to view your orders.",
    };

  const orders = await orderModel
    .find({ user: userId })
    .select("orderNumber status totalPrice createdAt paymentMethod")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  if (!orders.length)
    return {
      answer: "No orders found yet.",
    };

  const statusEmoji = {
    pending: "⏳",
    confirmed: "✅",
    shipped: "🚚",
    delivered: "📦",
    cancelled: "❌",
  };

  const list = orders
    .map(
      (o) =>
        `${statusEmoji[o.status] || "•"} Order #${o.orderNumber || o._id.toString().slice(-6)} — ${o.status} — ${o.totalPrice} EGP`,
    )
    .join("\n");

  return {
    answer: `📋 Your latest orders:\n${list}`,
  };
};

const handleWishlist = async (userId) => {
  if (!userId)
    return {
      answer: "You need to be logged in to view your wishlist.",
    };

  const items = await wishlistModel
    .find({ user: userId })
    .populate("product", "name price")
    .limit(10)
    .lean();

  if (!items.length)
    return {
      answer: "Your wishlist is empty right now.",
    };

  const list = items
    .filter((i) => i.product)
    .map((i) => `• ${i.product.name} — ${i.product.price} EGP`)
    .join("\n");

  return {
    answer: `💝 Your wishlist:\n${list}`,
  };
};

const handleCoupon = async (normalized) => {
  const words = normalized.split(" ");

  const codeIndex = words.findIndex((w) =>
    ["كوبون", "coupon", "كود", "code", "خصم"].includes(w),
  );

  const code =
    codeIndex !== -1 && words[codeIndex + 1]
      ? words[codeIndex + 1].toUpperCase()
      : null;

  if (!code)
    return {
      answer: "Please provide the coupon code. Example: SAVE20",
    };

  return {
    answer: `Go to your cart and enter the coupon code \"${code}\" to apply the discount. ✅`,
  };
};

const getKeywordScore = (normalizedMessage, keywords = []) => {
  let score = 0;

  const matchedKeywords = [];

  const messageWords = tokenizer.tokenize(normalizedMessage);

  for (const keyword of keywords) {
    const nk = normalizeText(keyword);

    if (!nk) continue;

    if (normalizedMessage.includes(nk)) {
      score += nk.split(" ").length > 1 ? 4 : 3;
      matchedKeywords.push(keyword);
      continue;
    }

    const keywordWords = tokenizer.tokenize(nk);

    let localScore = 0;

    for (const mw of messageWords) {
      for (const kw of keywordWords) {
        const similarity = natural.JaroWinklerDistance(mw, kw);

        if (similarity >= 0.9) {
          localScore += similarity;
        }
      }
    }

    if (localScore > 0) {
      score += localScore;
      matchedKeywords.push(keyword);
    }
  }

  return { score, matchedKeywords };
};

const handleFaq = async (normalizedMessage) => {
  const faqs = await faqModel
    .find({ isActive: true })
    .select("question answer keywords category")
    .lean();

  let bestMatch = null;

  for (const faq of faqs) {
    const { score, matchedKeywords } = getKeywordScore(
      normalizedMessage,
      faq.keywords,
    );

    const normalizedQuestion = normalizeText(faq.question);

    const questionSimilarity = natural.JaroWinklerDistance(
      normalizedMessage,
      normalizedQuestion,
    );

    const finalScore = score + questionSimilarity * 2;

    if (finalScore > 1.5 && (!bestMatch || finalScore > bestMatch.score)) {
      bestMatch = {
        score: finalScore,
        faq,
        matchedKeywords,
      };
    }
  }

  if (!bestMatch) return null;

  return {
    answer: bestMatch.faq.answer,
    matchedQuestion: bestMatch.faq.question,
    category: bestMatch.faq.category,
    matchedKeywords: bestMatch.matchedKeywords,
  };
};

export const getChatbotAnswer = async (message, userId = null) => {
  const normalized = normalizeText(message);

  if (!normalized)
    return {
      success: false,
      matched: false,
      answer: "Please type your message first.",
    };

  const intent = detectIntent(normalized);

  if (intent === "price") {
    const result = await handlePrice(normalized);

    return {
      success: true,
      matched: true,
      intent: "price",
      ...result,
    };
  }

  if (intent === "availability") {
    const result = await handleAvailability(normalized);

    return {
      success: true,
      matched: true,
      intent: "availability",
      ...result,
    };
  }

  if (intent === "category") {
    const result = await handleCategory(normalized);

    return {
      success: true,
      matched: true,
      intent: "category",
      ...result,
    };
  }

  if (intent === "orders") {
    const result = await handleOrders(userId);

    return {
      success: true,
      matched: true,
      intent: "orders",
      ...result,
    };
  }

  if (intent === "wishlist") {
    const result = await handleWishlist(userId);

    return {
      success: true,
      matched: true,
      intent: "wishlist",
      ...result,
    };
  }

  if (intent === "coupon") {
    const result = await handleCoupon(normalized);

    return {
      success: true,
      matched: true,
      intent: "coupon",
      ...result,
    };
  }

  const faqResult = await handleFaq(normalized);

  if (faqResult)
    return {
      success: true,
      matched: true,
      intent: "faq",
      ...faqResult,
    };

  return {
    success: true,
    matched: false,
    intent: "unknown",
    answer:
      "I could not fully understand your request. Try asking about products, prices, orders, wishlist, or coupons.",
  };
};

export const chatbotMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    const userId = req.user?._id || null;

    const result = await getChatbotAnswer(message, userId);

    return successResponse({
      res,
      data: result,
    });
  } catch (error) {
    throw new Error("Error while processing chatbot message.");
  }
};
