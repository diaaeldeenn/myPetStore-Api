import { ProviderEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.success.js";
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js";
import { CompareHash, Hash } from "../../common/utils/security/hash.security.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken";



export const signUp = async (req, res, next) => {
  const {userName,email,password,rePassword,age,gender,phone} = req.body;
  if (await db_service.findOne({ model: userModel, filter: { email } })) {
    throw new Error("User Already Exist",{cause:409});
  }
  try {
    const user = await db_service.create({
      model: userModel,
      data: { userName, email, password:Hash({plainText:password}), age, gender,phone:encrypt(phone)},
    });
    successResponse({res,status:201,data:user});
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
      filter: {
        email,
        provider: ProviderEnum.system,
      },
    });
    if (!user) {
      throw new Error("User Not Exist",{cause:409});
    }
    if (!CompareHash({plainText:password,cipherText:user.password})) {
      throw new Error("Invalid Password",{cause:400});
    }
    const token = jwt.sign({ userId: user._id },"DiaaDiaa",{ expiresIn: "1h" });
    successResponse({res,message:"LogIn Succefully",data:{token:token}});
  } catch (error) {
    next(error);
  }
};