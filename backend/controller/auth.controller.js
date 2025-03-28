import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const isValidUser = await User.findOne({
    email: email,
  });
  if (isValidUser) {
    return next(errorHandler(400, "Người dùng đã tồn tại"));
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "Người dùng đã được tạo thành công",
    });
  } catch (error) {
    return next(error);
  }
};
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "Không tìm thấy người dùng"));
    }
    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Thông tin đăng nhập không đúng"));
    }
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    
    const { password: pass, ...rest } = validUser._doc;
    res.cookie("access_token", token, { httpOnly: true }).status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      rest,
    });
  } catch (error) {
    return next(error);
  }
};
export const signout = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json({
      success: true,
      message: "Người dùng đã đăng xuất thành công",
    });
  } catch (error) {
    return next(error);
  }
};
