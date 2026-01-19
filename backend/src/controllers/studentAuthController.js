import Student from "../models/Student.js";
import jwt from "jsonwebtoken";
import { resolveTenantFromSubdomain } from "../utils/subdomainResolver.js";

const generateToken = (id, email, tenantId) =>
  jwt.sign({ id, email, role: "student", tenantId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const loginStudent = async (req, res) => {
  try {
    const { email, password, subdomain } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const emailQuery = String(email).trim();
    console.log("🔐 Student login attempt for email:", emailQuery, "subdomain:", subdomain);
    
    // 🔒 SECURITY: Resolve subdomain to tenantId
    if (!subdomain) {
      return res.status(400).json({ message: "Subdomain is required" });
    }
    
    const tenantId = await resolveTenantFromSubdomain(subdomain);
    if (!tenantId) {
      console.log("❌ Invalid subdomain:", subdomain);
      return res.status(404).json({ message: "Tenant not found" });
    }
    
    console.log("✅ Subdomain resolved:", subdomain, "→ TenantId:", tenantId);
    
    // 🔒 SECURITY: Find student by email AND tenant (not global)
    const student = await Student.findOne({ 
      email: { $regex: `^${emailQuery}$`, $options: "i" },
      tenantId: tenantId  // ⚠️ CRITICAL: Only students from this tenant
    });

    if (!student) {
      console.log("❌ Student not found for email:", emailQuery, "in tenant:", tenantId);
      return res.status(404).json({ message: "Email not found in this organization. Please check and try again." });
    }
    
    console.log("✅ Student found:", student.name, "| TenantId:", student.tenantId, "| Has password:", !!student.password);
    
    if (!student.password) {
      console.log("❌ Student has no password set");
      return res.status(401).json({ message: "Password not set for this account. Please contact your administrator." });
    }

    // Verify password
    const isMatch = await student.matchPassword(password);
    
    if (!isMatch) {
      console.log("❌ Password mismatch for student:", student.name);
      return res.status(401).json({ message: "Invalid password" });
    }
    
    console.log("✅ Login successful for student:", student.name);

    const token = generateToken(student._id, student.email, student.tenantId);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({ 
      success: true, 
      token,
      student: student.toObject() 
    });
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentStudent = async (req, res) => {
  try {
    // protectStudent middleware sets req.student, but we'll fetch fresh data from DB to ensure accuracy
    if (!req.student) return res.status(401).json({ message: "Not authenticated" });

    const Student = await import("../models/Student.js");
    const Batch = await import("../models/Batch.js");
    
    // 🔥 CRITICAL: Always fetch fresh data from database to match tenant admin portal exactly
    const freshStudent = await Student.default.findById(req.student._id);
    if (!freshStudent) {
      console.error(`❌ Student not found in DB for ID: ${req.student._id}`);
      return res.status(404).json({ message: "Student not found" });
    }

    let studentData = freshStudent.toObject ? freshStudent.toObject() : freshStudent;

    // 🔥 SYNC BATCH: Ensure batch name is always populated from batchId if missing
    if (studentData.batchId && (!studentData.batch || studentData.batch === '')) {
      try {
        const batchDoc = await Batch.default.findById(studentData.batchId).select('name');
        if (batchDoc) {
          studentData.batch = batchDoc.name;
          studentData.batchName = batchDoc.name;
          console.log(`   ✅ Synced batch from batchId: ${batchDoc.name}`);
          
          // Also update the student document to keep batch field in sync for future queries
          await Student.default.findByIdAndUpdate(studentData._id, {
            batch: batchDoc.name,
          }, { new: false }).catch(err => console.warn("Could not update batch field:", err.message));
        }
      } catch (batchErr) {
        console.warn(`   ⚠️  Could not fetch batch:`, batchErr.message);
      }
    }

    // Ensure batchName is set even if batch field exists
    if (!studentData.batchName) {
      studentData.batchName = studentData.batch;
    }

    // Include payment history for student with tenant isolation
    const Payment = await import("../models/Payment.js");
    const payments = await Payment.default.find({ 
      tenantId: studentData.tenantId,
      studentId: studentData._id 
    }).sort({ date: -1 }).lean();

    const responseData = { ...studentData, payments };

    console.log(`✅ STUDENT AUTH GET CURRENT (Fresh from DB + Synced):`);
    console.log(`   Student ID: ${freshStudent._id}`);
    console.log(`   Student Name: ${responseData.name}`);
    console.log(`   Student Email: ${responseData.email}`);
    console.log(`   TenantId: ${responseData.tenantId}`);
    console.log(`   Course: ${responseData.course}`);
    console.log(`   Batch: ${responseData.batch}`);
    console.log(`   BatchName: ${responseData.batchName}`);
    console.log(`   BatchId: ${responseData.batchId}`);
    console.log(`   Fees: ${responseData.fees}`);
    console.log(`   Balance: ${responseData.balance}`);
    console.log(`   Payments found: ${payments.length}`);

    res.status(200).json(responseData);
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
      tenantId: req.student.tenantId,
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

export const getStudentNotifications = async (req, res) => {
  try {
    if (!req.student) return res.status(401).json({ message: "Not authenticated" });

    const notifications = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 1. Fetch upcoming tests
    try {
      const Test = await import("../models/Test.js");
      const upcomingTests = await Test.default
        .find({
          tenantId: req.student.tenantId,
          date: { $gte: now, $lte: thirtyDaysFromNow },
          isActive: true
        })
        .sort({ date: 1 })
        .limit(3)
        .lean();

      upcomingTests.forEach(test => {
        const daysLeft = Math.ceil((new Date(test.date) - now) / (1000 * 60 * 60 * 24));
        notifications.push({
          id: `test_${test._id}`,
          type: 'test',
          emoji: '📝',
          label: 'Upcoming Test',
          title: test.name || test.subject || 'Test',
          date: test.date,
          badge: daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`,
          priority: daysLeft <= 3 ? 'high' : 'medium'
        });
      });
    } catch (err) {
      console.log('No tests found:', err.message);
    }

    // 2. Check for pending payments/fees
    try {
      const Payment = await import("../models/Payment.js");
      const totalPaid = await Payment.default.aggregate([
        { 
          $match: { 
            studentId: req.student._id,
            status: 'success'
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: "$amount" } 
          } 
        }
      ]);

      const paidAmount = totalPaid.length > 0 ? totalPaid[0].total : 0;
      const totalFees = req.student.fees || 0;
      const remainingAmount = totalFees - paidAmount;

      if (remainingAmount > 0) {
        notifications.push({
          id: `fee_${req.student._id}`,
          type: 'fee',
          emoji: '💰',
          label: 'Fee Reminder',
          title: 'Pending Payment',
          amount: remainingAmount,
          badge: 'Due Soon',
          priority: 'high'
        });
      }
    } catch (err) {
      console.log('Error checking payments:', err.message);
    }

    // 3. Check recent attendance (if low, add alert)
    try {
      const Attendance = await import("../models/Attendance.js");
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const recentAttendance = await Attendance.default.find({
        studentId: req.student._id,
        date: { $gte: thirtyDaysAgo, $lte: now }
      }).lean();

      if (recentAttendance.length > 0) {
        const presentCount = recentAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
        const percentage = (presentCount / recentAttendance.length) * 100;

        if (percentage < 75) {
          notifications.push({
            id: `attendance_${req.student._id}`,
            type: 'attendance',
            emoji: '⚠️',
            label: 'Attendance Alert',
            title: 'Low Attendance',
            date: now,
            badge: `${percentage.toFixed(0)}%`,
            priority: 'high'
          });
        }
      }
    } catch (err) {
      console.log('Error checking attendance:', err.message);
    }

    // Sort by priority and date
    notifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    res.status(200).json({
      success: true,
      notifications: notifications.slice(0, 5) // Limit to 5 most important
    });
  } catch (err) {
    console.error("Get student notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
