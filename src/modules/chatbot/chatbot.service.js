import { successResponse } from "../../common/utils/response.success.js";
import faqModel from "../../DB/models/faq.model.js";

const DEFAULT_FALLBACK_ANSWER =
  "لم أستطع فهم سؤالك بشكل واضح، من فضلك وضّح سؤالك أكثر.";

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

export const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .replace(/[أإآٱىةؤئ]/g, (char) => arabicMap[char] || char)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getKeywordScore = (normalizedMessage, keywords = []) => {
  let score = 0;
  const matchedKeywords = [];

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) continue;

    if (normalizedMessage.includes(normalizedKeyword)) {
      score += normalizedKeyword.split(" ").length > 1 ? 3 : 2;
      matchedKeywords.push(keyword);
    }
  }

  return { score, matchedKeywords };
};

export const getChatbotAnswer = async (message) => {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return {
      success: false,
      matched: false,
      answer: "من فضلك اكتب سؤالك أولًا.",
    };
  }

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
      bestMatch = {
        score,
        faq,
        matchedKeywords,
      };
    }
  }

  if (!bestMatch) {
    return {
      success: true,
      matched: false,
      answer: DEFAULT_FALLBACK_ANSWER,
    };
  }

  return {
    success: true,
    matched: true,
    answer: bestMatch.faq.answer,
    matchedQuestion: bestMatch.faq.question,
    category: bestMatch.faq.category,
    matchedKeywords: bestMatch.matchedKeywords,
  };
};

export const chatbotMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    const result = await getChatbotAnswer(message);

    return successResponse({
      res,
      data: result,
    });
  } catch (error) {
    throw new Error("Error while processing chatbot message.");
  }
};
