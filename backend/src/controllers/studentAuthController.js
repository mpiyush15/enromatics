import Student from "../models/Student.js";
import jwt from "jsonwebtoken";

const generateToken = (id, tenantId) =>
  jwt.sign({ id, role: "student", tenantId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const emailQuery = String(email).trim();
    console.log("🔐 Student login attempt for email:", emailQuery);
    // case-insensitive search to avoid mismatch due to casing or surrounding spaces
    const student = await Student.findOne({ email: { $regex: `^${emailQuery}$`, $options: "i" } });
    
    if (!student) {
      console.log("❌ Student not found with email:", emailQuery);
      return res.status(404).json({ message: "Student not found with this email. Please check your email address." });
    }
    
    console.log("✅ Student found:", student.name, "| Has password:", !!student.password);
    
    if (!student.password) {
      console.log("❌ Student has no password set");
      return res.status(401).json({ message: "Password not set for this account. Please contact your administrator to reset your password." });
    }

    const isMatch = await student.matchPassword(password);
    
    if (!isMatch) {
      console.log("❌ Password mismatch for student:", student.name);
      return res.status(401).json({ message: "Invalid password" });
    }
    
    console.log("✅ Login successful for student:", student.name);

    const token = generateToken(student._id, student.tenantId);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({ 
      success: true, 
      token, // Include token for mobile apps
      student: student.toObject() 
    });
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentStudent = async (req, res) => {
  try {
    // protectStudent middleware sets req.student
    if (!req.student) return res.status(401).json({ message: "Not authenticated" });

    // Include payment history for student
    const Payment = await import("../models/Payment.js");
    const payments = await Payment.default.find({ studentId: req.student._id }).sort({ date: -1 });

    res.status(200).json({ ...req.student.toObject(), payments });
  } catch (err) {
    console.error("Get current student error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    if (!req.student) return res.status(401).json({ message: "Not authenticated" });

    const { month, year } = req.query;
    const Attendance = await import("../models/Attendance.js");

    // If month/year provided, filter by that; otherwise get last 90 days
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      dateFilter = { $gte: startDate, $lte: endDate };
    } else {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      dateFilter = { $gte: ninetyDaysAgo };
    }

    const records = await Attendance.default.find({
      studentId: req.student._id,
      date: dateFilter
    }).sort({ date: -1 }).lean();

    // Calculate summary
    const summary = {
      total: records.length,
      present: records.filter(r => r.status === "present").length,
      absent: records.filter(r => r.status === "absent").length,
      late: records.filter(r => r.status === "late").length,
      excused: records.filter(r => r.status === "excused").length
    };

    const percentage = summary.total > 0 
      ? ((summary.present + summary.late) / summary.total * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      summary: { ...summary, percentage: parseFloat(percentage) },
      records
    });
  } catch (err) {
    console.error("Get student attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutStudent = (req, res) => {
  res.clearCookie("jwt", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  res.status(200).json({ message: "Logged out" });
};

export const updateStudentProfile = async (req, res) => {
  try {
    if (!req.student) return res.status(401).json({ message: "Not authenticated" });

    const { name, phone, address } = req.body;
    const allowedUpdates = {};
    
    if (name) allowedUpdates.name = name;
    if (phone) allowedUpdates.phone = phone;
    if (address !== undefined) allowedUpdates.address = address;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.student._id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("✅ Student profile updated:", updatedStudent.name);
    res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully",
      student: updatedStudent 
    });
  } catch (err) {
    console.error("Update student profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentPayments = async (req, res) => {
  try {
    if (!req.student) return res.status(401).json({ message: "Not authenticated" });

    const Payment = await import("../models/Payment.js");
    
    const payments = await Payment.default
      .find({ 
        studentId: req.student._id,
        tenantId: req.student.tenantId 
      })
      .sort({ date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      payments
    });
  } catch (err) {
    console.error("Get student payments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
