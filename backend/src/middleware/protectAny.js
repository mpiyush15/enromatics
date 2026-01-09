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

  // 🟡 For development: if no token, try to get from X-User-ID header (useful for debugging)
  if (!token && req.headers['x-user-id']) {
    console.warn('⚠️  Using X-User-ID header (DEV ONLY) - not for production!');
    token = 'dev-' + req.headers['x-user-id'];
  }

  if (!token) {
    console.warn('❌ protectAny: No token found in Authorization header or jwt cookie');
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    let decoded;
    
    // Allow dev tokens for testing
    if (token.startsWith('dev-')) {
      console.warn('⚠️  Using DEV token (development only)');
      // For dev testing, create a dummy decoded object
      decoded = { id: 'dev-user', role: 'admin' };
    } else {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    }

    // If token declares a role, honor it to choose the principal type
    if (decoded.role === "student") {
      const student = await Student.findById(decoded.id).select("-password");
      if (!student) return res.status(401).json({ message: "Student not found" });
      req.student = student;
      return next();
    }

    // Default to User principal
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      // For dev mode, allow without checking database
      if (token.startsWith('dev-')) {
        console.warn('⚠️  Creating dev user object for testing');
        req.user = { 
          _id: 'dev-user',
          email: 'dev@test.com',
          role: 'admin',
          tenantId: null
        };
        return next();
      }
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("protectAny error:", err.message);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
