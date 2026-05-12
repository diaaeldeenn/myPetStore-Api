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
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some((k) => normalized.includes(normalizeText(k)))) {
      return intent;
    }
  }
  return "faq";
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
  normalized
    .split(" ")
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .join(" ")
    .trim();

const handlePrice = async (normalized) => {
  const searchTerm = extractProductName(normalized);
  if (!searchTerm) return { answer: "اذكر اسم المنتج اللي عايز تعرف سعره." };

  const products = await productModel
    .find({ name: { $regex: searchTerm, $options: "i" } })
    .select("name price category weight")
    .limit(5)
    .lean();

  if (!products.length)
    return { answer: `مش لاقي منتج باسم "${searchTerm}"، جرب تكتب اسم تاني.` };

  if (products.length === 1) {
    const p = products[0];
    return {
      answer: `🛍️ *${p.name}*\n💰 السعر: ${p.price} جنيه\n📦 الفئة: ${p.category}`,
      products,
    };
  }

  const list = products.map((p) => `• ${p.name} — ${p.price} جنيه`).join("\n");
  return { answer: `لقيت أكتر من منتج:\n${list}`, products };
};

const handleAvailability = async (normalized) => {
  const searchTerm = extractProductName(normalized);
  if (!searchTerm) return { answer: "اذكر اسم المنتج اللي عايز تعرف عنه." };

  const products = await productModel
    .find({ name: { $regex: searchTerm, $options: "i" } })
    .select("name price category image")
    .limit(5)
    .lean();

  if (!products.length)
    return {
      answer: `مش لاقي منتج باسم "${searchTerm}"، ممكن تبحث بكلمة تانية.`,
    };

  if (products.length === 1) {
    const p = products[0];
    return {
      answer: `✅ أيوه، *${p.name}* متاح!\n💰 السعر: ${p.price} جنيه\n📦 الفئة: ${p.category}`,
      products,
    };
  }

  const list = products.map((p) => `• ${p.name} — ${p.price} جنيه`).join("\n");
  return { answer: `✅ الآتي متاح:\n${list}`, products };
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
    if (normalized.includes(normalizeText(key))) {
      matchedCategory = val;
      break;
    }
  }

  if (!matchedCategory)
    return { answer: "اذكر نوع الحيوان الأليف اللي بتسأل عنه." };

  const products = await productModel
    .find({ category: matchedCategory })
    .select("name price rating")
    .sort({ rating: -1 })
    .limit(5)
    .lean();

  if (!products.length)
    return { answer: `مفيش منتجات متاحة دلوقتي لفئة ${matchedCategory}.` };

  const list = products
    .map((p) => `• ${p.name} — ${p.price} جنيه ⭐ ${p.rating}`)
    .join("\n");
  return { answer: `🐾 أحسن منتجات ${matchedCategory}:\n${list}`, products };
};

const handleOrders = async (userId) => {
  if (!userId)
    return {
      answer: "لازم تكون logged in عشان تشوف أوردراتك. سجل دخول وجرب تاني 🔒",
    };

  const orders = await orderModel
    .find({ user: userId })
    .select("orderNumber status totalPrice createdAt paymentMethod")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  if (!orders.length)
    return { answer: "مفيش أوردرات لحد دلوقتي. ابدأ تتسوق! 🛒" };

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
        `${statusEmoji[o.status] || "•"} أوردر #${o.orderNumber || o._id.toString().slice(-6)} — ${o.status} — ${o.totalPrice} جنيه`,
    )
    .join("\n");

  return { answer: `📋 أحدث أوردراتك:\n${list}` };
};

const handleWishlist = async (userId) => {
  if (!userId)
    return {
      answer:
        "لازم تكون logged in عشان تشوف المفضلة بتاعتك. سجل دخول وجرب تاني 🔒",
    };

  const items = await wishlistModel
    .find({ user: userId })
    .populate("product", "name price")
    .limit(10)
    .lean();

  if (!items.length)
    return { answer: "المفضلة فاضية دلوقتي. ضيف منتجات عجبوك! 💝" };

  const list = items
    .filter((i) => i.product)
    .map((i) => `• ${i.product.name} — ${i.product.price} جنيه`)
    .join("\n");

  return { answer: `💝 المفضلة بتاعتك:\n${list}` };
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
    return { answer: "اذكر كود الكوبون عشان أتحقق منه. مثال: كوبون SAVE20" };

  return {
    answer: `عشان تطبق الكوبون، روح على الـ Cart وادخل الكود "${code}" في خانة الكوبون. لو الكود صح هيتطبق الخصم على الفاتورة ✅`,
  };
};

const getKeywordScore = (normalizedMessage, keywords = []) => {
  let score = 0;
  const matchedKeywords = [];
  for (const keyword of keywords) {
    const nk = normalizeText(keyword);
    if (!nk) continue;
    if (normalizedMessage.includes(nk)) {
      score += nk.split(" ").length > 1 ? 3 : 2;
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
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { score, faq, matchedKeywords };
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
      answer: "من فضلك اكتب سؤالك أولًا.",
    };

  const intent = detectIntent(normalized);

  if (intent === "price") {
    const result = await handlePrice(normalized);
    return { success: true, matched: true, intent: "price", ...result };
  }

  if (intent === "availability") {
    const result = await handleAvailability(normalized);
    return { success: true, matched: true, intent: "availability", ...result };
  }

  if (intent === "category") {
    const result = await handleCategory(normalized);
    return { success: true, matched: true, intent: "category", ...result };
  }

  if (intent === "orders") {
    const result = await handleOrders(userId);
    return { success: true, matched: true, intent: "orders", ...result };
  }

  if (intent === "wishlist") {
    const result = await handleWishlist(userId);
    return { success: true, matched: true, intent: "wishlist", ...result };
  }

  if (intent === "coupon") {
    const result = await handleCoupon(normalized);
    return { success: true, matched: true, intent: "coupon", ...result };
  }

  const faqResult = await handleFaq(normalized);
  if (faqResult)
    return { success: true, matched: true, intent: "faq", ...faqResult };

  return {
    success: true,
    matched: false,
    intent: "unknown",
    answer:
      "مش فاهم سؤالك كويس 😅 ممكن تسألني عن سعر منتج، أوردر، أو حاجة تانية؟",
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