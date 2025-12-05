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
  
  // Support both web (id) and mobile (userId) token formats
  const userId = decoded.id || decoded.userId;
  req.user = await User.findById(userId).select("-password");

  if (!req.user) {
    console.log("❌ No user found for decoded id:", userId);
    return res.status(401).json({ message: "User not found" });
  }
  
  // Add additional mobile-specific data to req.user for mobile endpoints
  if (decoded.tenantId) {
    req.user.tenantId = decoded.tenantId;
  }
  if (decoded.studentId) {
    req.user.studentId = decoded.studentId;
  }

  next();
} catch (error) {
  console.error("❌ Auth middleware error:", error.message);
  return res.status(401).json({ message: "Not authorized, token invalid" });
}
   
};

/**
 * Check if user is Super Admin
 */
export const checkSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ 
      message: 'Access denied. Super admin privileges required.' 
    });
  }

  next();
};

/**
 * Check if user is Admin or Super Admin
 */
export const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }

  next();
};
