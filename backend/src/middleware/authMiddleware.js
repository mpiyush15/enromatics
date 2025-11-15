import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // ✅ Support both Bearer header & Cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("✅ Decoded token:", decoded);
  req.user = await User.findById(decoded.id).select("-password");

  if (!req.user) {
    console.log("❌ No user found for decoded id:", decoded.id);
    return res.status(401).json({ message: "User not found" });
  }

  next();
} catch (error) {
  console.error("❌ Auth middleware error:", error.message);
  return res.status(401).json({ message: "Not authorized, token invalid" });
}
   
};
