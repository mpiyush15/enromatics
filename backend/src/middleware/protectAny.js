import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";

export const protectAny = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If token declares a role, honor it to choose the principal type
    if (decoded.role === "student") {
      const student = await Student.findById(decoded.id).select("-password");
      if (!student) return res.status(401).json({ message: "Student not found" });
      req.student = student;
      return next();
    }

    // Default to User principal
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    console.error("protectAny error:", err.message);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
