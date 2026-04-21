import cloudinary from "../../common/utils/cloudinary.js";
import { successResponse } from "../../common/utils/response.success.js";
import * as db_service from "../../DB/db.service.js";
import productModel from "../../DB/models/product.model.js";

const shuffleProducts = (products) => {
  let seed = 42;
  const seededRandom = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return products.sort(() => seededRandom() - 0.5);
};

export const addProduct = async (req, res, next) => {
  const { name, description, price, category, weight, rating } = req.body;
  try {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: `myPetStore/products/${category}` },
    );
    const product = await db_service.create({
      model: productModel,
      data: {
        name,
        description,
        price,
        category,
        weight,
        image: { secure_url, public_id },
        rating,
      },
    });
    successResponse({ res, status: 201, data: product });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { page, limit: limitQuery } = req.query;

    let products;
    let paginationData = null;

    if (page || limitQuery) {
      const currentPage = Math.max(1, parseInt(page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(limitQuery) || 10));
      const skip = (currentPage - 1) * limit;
      const total = await productModel.countDocuments();

      products = await db_service.find({
        model: productModel,
        options: { skip, limit },
      });

      paginationData = {
        total,
        page: currentPage,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      products = await db_service.find({ model: productModel });
    }

    const shuffled = shuffleProducts(products);

    successResponse({
      res,
      status: 200,
      data: paginationData
        ? { products: shuffled, pagination: paginationData }
        : shuffled,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

export const getSpeceficProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await db_service.findById({
      model: productModel,
      id: productId,
    });
    if (!product) {
      throw new Error("Product Not Found", { cause: 404 });
    }
    successResponse({ res, status: 200, data: product });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

export const filterProducts = async (req, res, next) => {
  const {
    category,
    name,
    minPrice,
    maxPrice,
    page,
    limit: limitQuery,
  } = req.query;
  try {
    const filter = {};
    if (category) filter.category = category;
    if (name) filter.name = { $regex: name, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let products;
    let paginationData = null;

    if (page || limitQuery) {
      const currentPage = Math.max(1, parseInt(page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(limitQuery) || 10));
      const skip = (currentPage - 1) * limit;
      const total = await productModel.countDocuments(filter);

      products = await db_service.find({
        model: productModel,
        filter,
        options: { skip, limit },
      });

      paginationData = {
        total,
        page: currentPage,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      products = await db_service.find({ model: productModel, filter });
    }

    const shuffled = shuffleProducts(products);

    successResponse({
      res,
      status: 200,
      data: paginationData
        ? { products: shuffled, pagination: paginationData }
        : shuffled,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};
