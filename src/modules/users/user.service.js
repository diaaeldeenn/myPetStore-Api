import { sendEmailOtp } from "../../common/utils/email/email.otp.js";
import { successResponse } from "../../common/utils/response.success.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/security/encrypt.security.js";
import {
  CompareHash,
  Hash,
} from "../../common/utils/security/hash.security.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import { deleteKey, get, set } from "../../DB/redis/redis.service.js";

export const signUp = async (req, res, next) => {
  const { userName, email, password, rePassword, age, gender, phone } =
    req.body;
  if (await db_service.findOne({ model: userModel, filter: { email } })) {
    throw new Error("User Already Exist", { cause: 409 });
  }
  try {
    const user = await db_service.create({
      model: userModel,
      data: {
        userName,
        email,
        password: Hash({ plainText: password }),
        age,
        gender,
        phone: encrypt(phone),
      },
    });
    successResponse({ res, status: 201, data: user });
  } catch (error) {
    res.status(500).json({
      message: "Server Error!",
      message: error.message,
      stack: error.stack,
    });
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await db_service.findOne({
      model: userModel,
      filter: { email },
    });
    if (!user) {
      throw new Error("User Not Exist", { cause: 409 });
    }
    if (!CompareHash({ plainText: password, cipherText: user.password })) {
      throw new Error("Invalid Password", { cause: 400 });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    successResponse({
      res,
      message: "LogIn Succefully",
      data: { token: token },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { password, createdAt, updatedAt, __v, ...rest } = req.user._doc;
    successResponse({ res, data: { ...rest, phone: decrypt(req.user.phone) } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    let { firstName, lastName, gender, phone, age } = req.body;
    if (phone) {
      phone = encrypt(phone);
    }
    const user = await db_service.findOneAndUpdate({
      model: userModel,
      filter: { _id: req.user._id },
      update: { firstName, lastName, gender, phone, age },
    });
    if (!user) {
      throw new Error("User Not Exist");
    }
    successResponse({
      res,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    let { oldPassword, newPassword } = req.body;
    if (
      !CompareHash({ plainText: oldPassword, cipherText: req.user.password })
    ) {
      throw new Error("Invalid old Password", { cause: 400 });
    }
    const hashNewPassword = Hash({ plainText: newPassword });
    req.user.password = hashNewPassword;
    req.user.logOutTime = new Date();
    await req.user.save();
    successResponse({ res });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await db_service.findOne({
      model: userModel,
      filter: {
        email,
      },
    });
    if (!user) {
      throw new Error("User Not Exist", { cause: 409 });
    }
    await sendEmailOtp(email);
    successResponse({ res, message: "Otp Send Succefully" });
  } catch (error) {
    next(error);
  }
};

export const confirmPassword = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const otpValue = await get(`otp::${email}`);
    if (!otpValue) {
      throw new Error("Invalid or Expired OTP");
    }
    if (!CompareHash({ plainText: otp, cipherText: otpValue })) {
      throw new Error("Otp Is Invalid");
    }
    await deleteKey(`otp::${email}`);
    await deleteKey(`max_otp::${email}`);
    await set({ key: `verified_otp::${email}`, value: 1, ttl: 60 * 5 });
    successResponse({ res, message: "Otp Is Valid" });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    const isVerified = await get(`verified_otp::${email}`);
    if (!isVerified) {
      throw new Error("Otp not verified");
    }

    const user = await db_service.findOne({
      model: userModel,
      filter: { email },
    });

    if (!user) {
      throw new Error("User Not Exist", { cause: 409 });
    }

    const isSamePassword = CompareHash({
      plainText: newPassword,
      cipherText: user.password,
    });

    if (isSamePassword) {
      throw new Error("New password must be different from old password", {
        cause: 400,
      });
    }

    await db_service.findOneAndUpdate({
      model: userModel,
      filter: { email },
      update: {
        password: Hash({ plainText: newPassword }),
        logOut: new Date(),
      },
    });

    await deleteKey(`verified_otp::${email}`);
    await deleteKey(`confirm_tries::${email}`);

    successResponse({ res, message: "Password Reset Successfully" });
  } catch (error) {
    next(error);
  }
};

