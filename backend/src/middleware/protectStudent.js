import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

export const protectStudent = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    console.log("❌ protectStudent: No token found");
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Support both web tokens (id) and mobile tokens (studentId/userId)
    const studentId = decoded.id || decoded.studentId || decoded.userId;
    console.log("🔍 protectStudent: Token decoded:", { 
      id: decoded.id, 
      userId: decoded.userId, 
      studentId: decoded.studentId,
      role: decoded.role,
      finalStudentId: studentId 
    });
    
    req.student = await Student.findById(studentId).select("-password");
    if (!req.student) {
      console.log("❌ protectStudent: Student not found for ID:", studentId);
      return res.status(401).json({ message: "Student not found" });
    }
    
    console.log("✅ protectStudent: Student authenticated:", req.student.email);
    next();
  } catch (err) {
    console.error("❌ protectStudent auth error:", err.message);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
