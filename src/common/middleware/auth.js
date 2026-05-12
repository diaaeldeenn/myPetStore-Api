import jwt from "jsonwebtoken";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";

export const authentication = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      throw new Error("Token Not Provide");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    if (!decoded || !userId) {
      throw new Error("Invalid Token");
    }
    const user = await db_service.findOne({
      model: userModel,
      filter: { _id: userId },
    });
    if (!user) {
      throw new Error("User Not Found");
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};



export const optionalAuthentication = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) return next();

    const user = await db_service.findOne({
      model: userModel,
      filter: { _id: decoded.userId },
    });

    req.user = user || null;
    next();
  } catch (error) {
    next();
  }
};
