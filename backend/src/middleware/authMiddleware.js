import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // ✅ Priority 1: Authorization Bearer header (best practice)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("✅ Token from Authorization Bearer header");
  } 
  // ✅ Priority 2: jwt cookie (NextJS/Vercel)
  else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
    console.log("✅ Token from jwt cookie");
  }
  // ✅ Priority 3: token cookie (fallback for compatibility)
  else if (req.cookies?.token) {
    token = req.cookies.token;
    console.log("✅ Token from token cookie (legacy)");
  }
  else {
    console.warn("⚠️ No token found");
    console.warn("⚠️ Auth Headers:", req.headers.authorization ? "Present" : "Missing");
    console.warn("⚠️ Cookies available:", Object.keys(req.cookies || {}));
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded token:", { id: decoded.id, email: decoded.email, role: decoded.role });
    
    // Support both web (id) and mobile (userId) token formats
    const userId = decoded.id || decoded.userId;
    req.user = await User.findById(userId).select("-password");

    if (!req.user) {
      console.log("❌ No user found for decoded id:", userId);
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log("✅ User authenticated:", { email: req.user.email, role: req.user.role, tenantId: req.user.tenantId });
    
    // Add additional mobile-specific data to req.user for mobile endpoints
    if (decoded.tenantId) {
      req.user.tenantId = decoded.tenantId;
      console.log("✅ Set tenantId from token:", decoded.tenantId);
    } else if (!req.user.tenantId) {
      console.warn("⚠️ WARNING: No tenantId in token or user document!");
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
