import mongoose from "mongoose";
import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import Batch from "../models/Batch.js";
import BatchStudent from "../models/BatchStudent.js";
import Tenant from "../models/Tenant.js";
import * as planGuard from "../../lib/planGuard.js";
import whatsappEventService from "../services/whatsappEventService.js";
import emailService from "../services/emailService.js";

export const addStudent = async (req, res) => {
  try {
    const { name, email, phone, gender, course, batchId, address, fees, password, dateOfBirth } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(403).json({ message: "Tenant ID missing" });
    }

    // Plan & trial checks
    const tenant = await Tenant.findOne({ tenantId });
    if (tenant?.subscription?.status === "trial") {
      const trialStartISO =
        tenant.subscription.trialStartDate?.toISOString() ||
        tenant.subscription.startDate?.toISOString();

      if (planGuard.isTrialExpired({ trialStartISO })) {
        return res.status(402).json({
          success: false,
          code: "trial_expired",
          message: "Trial expired. Please upgrade.",
        });
      }
    }

    // Student cap
    const tierKey = req.user?.subscriptionTier || "basic";
    const currentCount = await Student.countDocuments({ tenantId });
    const capCheck = planGuard.checkStudentCap({ tierKey, currentStudents: currentCount });
    if (!capCheck.allowed) {
      return res.status(402).json({
        success: false,
        code: "upgrade_required",
        message: `Student limit reached (${capCheck.cap})`,
      });
    }

    // Batch prefix and batch name
    let batchPrefix = "ST";
    let batchName = null;
    if (batchId) {
      const batch = await Batch.findById(batchId).lean();
      if (batch?.name) {
        batchPrefix = batch.name.substring(0, 2).toUpperCase();
        batchName = batch.name; // 🔥 Save batch name
      }
    }

    // 🔥 IMPROVED ROLL NUMBER LOGIC
    // Format: <year><batchPrefix><sequence>
    // Example: 2025MA001 (Year 2025, Batch MA, Sequence 001)
    const currentYear = new Date().getFullYear();
    
    // Count students in this batch admitted in the current year
    const seq = (await Student.countDocuments({ 
      tenantId, 
      batchId,
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lt: new Date(`${currentYear + 1}-01-01`)
      }
    })) + 1;
    
    const rollNumber = `${currentYear}${batchPrefix}${String(seq).padStart(3, "0")}`;
    const studentPassword = password || Math.random().toString(36).slice(-8);

    const student = await Student.create({
      tenantId,
      name,
      email,
      phone,
      gender,
      course,
      batchId: batchId || null,
      batch: batchName, // 🔥 Store batch name
      address: address || "",
      fees: Number(fees) || 0,
      balance: 0,
      password: studentPassword,
      rollNumber,
      dateOfBirth: dateOfBirth || null,
    });

    if (batchId) {
      await Batch.findByIdAndUpdate(batchId, { $inc: { enrolledCount: 1 } });
      
      // 🔥 NEW: Create BatchStudent mapping
      await BatchStudent.create({
        tenantId,
        studentId: student._id,
        batchId,
        status: "active",
        joinedAt: new Date(),
      });
      console.log(`✅ Student ${student.name} added to batch via BatchStudent`);
    }

    // 🔥 TRIGGER: Send enrollment notifications if enabled
    try {
      const tenant = await Tenant.findOne({ tenantId }).select(
        "eventTriggers email instituteName contact subdomain"
      );
      
      if (tenant?.eventTriggers?.enrollmentNotifications?.enabled) {
        console.log(`🎯 [TRIGGER] Enrollment notifications enabled for tenant ${tenantId}`);
        
        // Build portal URL (use subdomain if available)
        const portalUrl = tenant?.subdomain 
          ? `https://${tenant.subdomain}.enromatics.com/student/login`
          : `https://portal.enromatics.com/student/login`;

        // Prepare student data for notifications
        const studentDataForNotification = {
          _id: student._id,
          name: student.name,
          phone: student.phone,
          rollNumber: student.rollNumber,
          batch: student.batch || batchName,
          portalUrl,
          password: studentPassword,
          googlePlayUrl: "" // For now, blank as app not available
        };

        // 📱 Send WhatsApp notification to student
        console.log(`📱 Sending WhatsApp enrollment notification to ${student.name}`);
        whatsappEventService.sendEnrollmentNotification(tenantId, studentDataForNotification).catch(
          err => console.error("WhatsApp enrollment notification failed:", err.message)
        );

        // 📧 Send email notification to tenant/client if email trigger enabled
        if (tenant?.eventTriggers?.enrollmentNotifications?.emailEnabled && tenant?.email) {
          console.log(`📧 Sending email enrollment notification to ${tenant.email}`);
          emailService.sendEnrollmentNotificationEmail({
            to: tenant.email,
            studentName: student.name,
            batchName: student.batch || batchName || "Program",
            studentPhone: student.phone,
            rollNumber: student.rollNumber,
            portalUrl,
            loginId: student.rollNumber,
            instituteName: tenant.instituteName || "Our Institute",
            tenantId
          }).catch(
            err => console.error("Email enrollment notification failed:", err.message)
          );
        }
      } else {
        console.log(`⚠️  Enrollment notifications disabled for tenant ${tenantId}`);
      }
    } catch (triggerError) {
      console.error("❌ Enrollment trigger error (non-blocking):", triggerError.message);
      // Don't block student creation if trigger fails
    }

    res.status(201).json({
      success: true,
      student,
      ...(password ? {} : { generatedPassword: studentPassword }),
    });
  } catch (err) {
    console.error("Add student error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getStudents = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    console.log("🔍 getStudents called - tenantId:", tenantId, "user:", req.user);
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { page = 1, limit = 10, batchId, batch, name, rollNumber, feesStatus } = req.query;
    console.log("📋 Query params:", { batchId, batch, name, rollNumber, feesStatus, page, limit });
    const pageNum = Number(page);
    const lim = Math.min(Number(limit), 100);

    /* ---------------- MATCH ---------------- */
    const match = { tenantId };

    // Flexible batch search - case insensitive partial match
    if (batch) {
      match.batch = { $regex: batch, $options: "i" };
    }

    // Exact batchId filter (if provided)
    if (batchId) {
      try {
        match.batchId = new mongoose.Types.ObjectId(batchId);
        console.log("🔍 Filtering by batchId:", batchId);
      } catch (err) {
        console.warn("⚠️ Invalid batchId format:", batchId, err.message);
        // If invalid, don't add to match - will return no results which is correct
      }
    }

    // Flexible student name search - case insensitive partial match
    if (name) {
      match.name = { $regex: name, $options: "i" };
      console.log("🔍 Filtering by student name:", name);
    }

    // Flexible roll number search - case insensitive partial match
    if (rollNumber) {
      match.rollNumber = { $regex: rollNumber, $options: "i" };
    }

    console.log("📋 Final match filter:", JSON.stringify(match));

    /* ---------------- PIPELINE ---------------- */
    const pipeline = [{ $match: match }];

    if (feesStatus === "paid_gt_50") {
      pipeline.push({
        $match: {
          $expr: {
            $gt: [{ $divide: ["$balance", "$fees"] }, 0.5],
          },
        },
      });
    }

    if (feesStatus === "remaining_gt_50") {
      pipeline.push({
        $match: {
          $expr: {
            $gt: [{ $divide: [{ $subtract: ["$fees", "$balance"] }, "$fees"] }, 0.5],
          },
        },
      });
    }

    /* 🔥 BATCH LOOKUP (IMPORTANT) */
    pipeline.push(
      {
        $lookup: {
          from: "batches",
          localField: "batchId",
          foreignField: "_id",
          as: "batchData",
        },
      },
      {
        $addFields: {
          batch: {
            $cond: [
              { $gt: [{ $size: "$batchData" }, 0] },
              { $arrayElemAt: ["$batchData.name", 0] },
              "$batch", // Fallback to existing batch field
            ],
          },
          batchCourseId: {
            $cond: [
              { $gt: [{ $size: "$batchData" }, 0] },
              { $arrayElemAt: ["$batchData.courseId", 0] },
              null,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "batchCourseId",
          foreignField: "_id",
          as: "courseData",
        },
      },
      {
        $addFields: {
          courseName: {
            $cond: [
              { $gt: [{ $size: "$courseData" }, 0] },
              { $arrayElemAt: ["$courseData.name", 0] },
              "$course", // Fallback to existing course field
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          tenantId: 1,
          name: 1,
          email: 1,
          phone: 1,
          gender: 1,
          course: "$courseName", // Use looked-up course name
          batch: 1,
          batchName: "$batch", // Map batch to batchName for consistency
          batchId: 1,
          rollNumber: 1,
          address: 1,
          fees: 1,
          balance: 1,
          status: 1,
          joinDate: 1,
          createdAt: 1,
        },
      }
    );

    /* ---------------- COUNT ---------------- */
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Student.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    /* ---------------- PAGINATION ---------------- */
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (pageNum - 1) * lim },
      { $limit: lim }
    );

    const students = await Student.aggregate(pipeline);

    /* ---------------- QUOTA ---------------- */
    console.log(`✅ Found ${students.length} students matching filter`);
    const totalStudents = await Student.countDocuments({ tenantId });
    const tenant = await Tenant.findOne({ tenantId }).select("plan").lean();
    const quotaCheck = planGuard.checkStudentCap({
      tierKey: tenant?.plan || "trial",
      currentStudents: totalStudents,
    });

    res.json({
      success: true,
      students,
      page: pageNum,
      pages: Math.ceil(total / lim) || 1,
      total,
      quota: {
        current: totalStudents,
        cap: quotaCheck.cap,
        canAdd: quotaCheck.allowed,
        plan: tenant?.plan,
      },
    });
  } catch (err) {
    console.error("❌ Get students error:", err.message, err.stack);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};


export const getStudentById = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    // 🔥 FIXED: Use aggregation with batch/course lookup (same as getStudents)
    const students = await Student.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          tenantId: tenantId,
        },
      },
      // Lookup batch by batchId to get current batch info
      {
        $lookup: {
          from: "batches",
          localField: "batchId",
          foreignField: "_id",
          as: "batchData",
        },
      },
      // Extract batch name from batch data
      {
        $addFields: {
          batchName: {
            $cond: [
              { $gt: [{ $size: "$batchData" }, 0] },
              { $arrayElemAt: ["$batchData.name", 0] },
              "$batch", // Fallback to existing batch field if batch not found
            ],
          },
          batchCourseId: {
            $cond: [
              { $gt: [{ $size: "$batchData" }, 0] },
              { $arrayElemAt: ["$batchData.courseId", 0] },
              null,
            ],
          },
        },
      },
      // Lookup course by courseId from batch
      {
        $lookup: {
          from: "courses",
          localField: "batchCourseId",
          foreignField: "_id",
          as: "courseData",
        },
      },
      // Extract course name from course data
      {
        $addFields: {
          course: {
            $cond: [
              { $gt: [{ $size: "$courseData" }, 0] },
              { $arrayElemAt: ["$courseData.name", 0] },
              "$course", // Fallback to stored course field
            ],
          },
        },
      },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          tenantId: 1,
          name: 1,
          email: 1,
          phone: 1,
          gender: 1,
          course: 1,
          batchName: 1,
          batchId: 1,
          rollNumber: 1,
          address: 1,
          fees: 1,
          balance: 1,
          status: 1,
          joinDate: 1,
          createdAt: 1,
        },
      },
    ]);

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = students[0];

    // fetch payments for this student
    const payments = await Payment.find({ tenantId, studentId: student._id }).sort({ date: -1 });

    console.log(`✅ STUDENT DETAILS RESPONSE:`);
    console.log(`   Student ID: ${student._id}`);
    console.log(`   Student Name: ${student.name}`);
    console.log(`   Fees: ${student.fees}`);
    console.log(`   Balance: ${student.balance}`);
    console.log(`   TenantId: ${tenantId}`);
    console.log(`   Payments found: ${payments.length}`);
    if (payments.length > 0) {
      console.log(`   Sample payment:`, {
        _id: payments[0]._id,
        amount: payments[0].amount,
        date: payments[0].date,
        method: payments[0].method,
        status: payments[0].status
      });
    }

    res.status(200).json({ success: true, student, payments });
  } catch (err) {
    console.error("Get student error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;
    const updates = req.body;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    // Only allow certain fields to be updated
    const allowed = ["name", "email", "phone", "gender", "course", "batch", "batchId", "address", "fees", "status"];
    const payload = {};
    allowed.forEach((k) => {
      if (updates[k] !== undefined) payload[k] = updates[k];
    });

    // Ensure fees and balance are numeric
    if (payload.fees !== undefined) payload.fees = Number(payload.fees);

    // Get the current student to check if batchId changed
    const currentStudent = await Student.findOne({ _id: id, tenantId });
    if (!currentStudent) return res.status(404).json({ message: "Student not found" });

    const oldBatchId = currentStudent.batchId?.toString();
    const newBatchId = payload.batchId ? payload.batchId.toString() : undefined;

    // 🔥 FIX: If batchId is changing, lookup new batch name and sync it
    if (newBatchId && oldBatchId !== newBatchId) {
      const newBatch = await Batch.findById(newBatchId).select('name');
      if (newBatch) {
        payload.batchName = newBatch.name;  // 🔥 CRITICAL: Keep batchName in sync with batchId
        console.log(`[UPDATE STUDENT] Will sync batchName: ${currentStudent.batchName} → ${newBatch.name}`);
      }
    }

    // Update the student
    const student = await Student.findOneAndUpdate({ _id: id, tenantId }, { $set: payload }, { new: true });

    // Handle BatchStudent sync if batchId changed
    if (newBatchId && oldBatchId !== newBatchId) {
      console.log(`[UPDATE STUDENT] Batch changed for student ${id}: ${oldBatchId} → ${newBatchId}`);

      // Remove from old batch
      if (oldBatchId) {
        await BatchStudent.deleteMany({ 
          tenantId, 
          studentId: id, 
          batchId: oldBatchId 
        });
        console.log(`  ✓ Removed from old batch ${oldBatchId}`);
      }

      // Add to new batch
      await BatchStudent.create({
        tenantId,
        studentId: id,
        batchId: newBatchId,
        status: "active",
        joinedAt: new Date(),
      });
      console.log(`  ✓ Added to new batch ${newBatchId}`);
    }

    res.status(200).json({ success: true, student });
  } catch (err) {
    console.error("Update student error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin reset student password (generate or set new password)
/*
export const resetStudentPassword = async (req, res) => {
  try {

    const tenantId = req.user?.tenantId;
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });
  // If newPassword is not provided, generate a random one
  const generated = newPassword || Math.random().toString(36).slice(-8);

  const student = await Student.findOne({ _id: id, tenantId });
    if (!student) return res.status(404).json({ message: "Student not found" });

  student.password = generated;
  await student.save();

  // Return the (possibly generated) new password so admin can share it
  res.status(200).json({ success: true, message: "Password reset", newPassword: generated });
  } catch (err) {
    console.error("Reset student password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
*/

//Temp fix for reset password issue

export const resetStudentPassword = async (req, res) => {
  try {
    console.log("🔑 Reset password start");

    const tenantId = req.user?.tenantId;
    const { id } = req.params;

    if (!tenantId) {
      console.log("❌ Tenant missing");
      return res.status(403).json({ message: "Tenant ID missing" });
    }

    const generated = Math.random().toString(36).slice(-8);
    console.log("✅ Generated password:", generated);

    const student = await Student.findOne({ _id: id, tenantId });
    if (!student) {
      console.log("❌ Student not found");
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("✅ Student found");

    student.password = generated;
    await student.save({ validateBeforeSave: false });
    console.log("🟡 Before save");

    await student.save(); // 🔥 ERROR IS HERE

    console.log("🟢 After save");

    return res.status(200).json({
      success: true,
      newPassword: generated,
    });

  } catch (err) {
    console.error("🔥 RESET PASSWORD REAL ERROR:", err);
    return res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  }
};


/**
 * Bulk upload students from CSV
 * CSV format: name,email,phone,gender,course,batch,address,fees
 */
export const bulkUploadStudents = async (req, res) => {
  try {
    const { students } = req.body; // Array of student objects
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(403).json({ 
        success: false,
        message: "Tenant ID missing" 
      });
    }

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No student data provided" 
      });
    }

    const results = {
      success: [],
      failed: [],
      total: students.length
    };

    // Pre-check overall cap before processing
    const tierKey = req.user?.subscriptionTier || "basic";
    const currentCount = await Student.countDocuments({ tenantId });
    const capCheck = planGuard.checkStudentCap({ tierKey, currentStudents: currentCount });
    if (!capCheck.allowed) {
      return res.status(402).json({
        success: false,
        code: "upgrade_required",
        message: `Student limit reached for your plan (${capCheck.cap}). Please upgrade to ${capCheck.upgradeTo || "a higher plan"}.`,
        details: capCheck,
      });
    }

    // Get initial count for roll number generation
    const currentYear = new Date().getFullYear();
    const initialCount = await Student.countDocuments({ 
      tenantId,
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lt: new Date(`${currentYear + 1}-01-01`)
      }
    });
    let rollNumberSequence = initialCount + 1;

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];
      
      try {
        const { name, email, phone, gender, course, batch, batchId, address, fees } = studentData;

        // Validate required fields
        if (!name || !email) {
          results.failed.push({
            row: i + 1,
            data: studentData,
            error: "Name and email are required"
          });
          continue;
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ 
          tenantId, 
          email: email.toLowerCase() 
        });

        if (existingStudent) {
          results.failed.push({
            row: i + 1,
            data: studentData,
            error: "Student with this email already exists"
          });
          continue;
        }

        // Generate password
        const studentPassword = Math.random().toString(36).slice(-8);

        // 🔥 IMPROVED ROLL NUMBER LOGIC - Unique sequence per student
        // Format: <year><batchPrefix><sequence>
        const batchPrefix = (batch || "ST").substring(0, 2).toUpperCase();
        const seqStr = String(rollNumberSequence).padStart(3, "0");
        const rollNumber = `${currentYear}${batchPrefix}${seqStr}`;
        
        // Increment sequence for next student
        rollNumberSequence++;

        // Create student (check cap progressively)
        const currentBeforeCreate = await Student.countDocuments({ tenantId });
        const progressiveCheck = planGuard.checkStudentCap({ tierKey, currentStudents: currentBeforeCreate });
        if (!progressiveCheck.allowed) {
          results.failed.push({
            row: i + 1,
            data: studentData,
            error: `Plan limit reached at ${progressiveCheck.cap}. Upgrade required`,
          });
          continue;
        }

        // Create student
        const newStudent = await Student.create({
          tenantId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone || "",
          gender: gender || "Other",
          course: course || "",
          batch: batch || "",
          batchId: batchId || null,
          address: address || "",
          fees: fees ? Number(fees) : 0,
          balance: 0,
          password: studentPassword,
          rollNumber,
        });

        results.success.push({
          row: i + 1,
          student: {
            name: newStudent.name,
            email: newStudent.email,
            rollNumber: newStudent.rollNumber,
            password: studentPassword
          }
        });

      } catch (error) {
        results.failed.push({
          row: i + 1,
          data: studentData,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk upload completed: ${results.success.length} successful, ${results.failed.length} failed`,
      results
    });

  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ 
      success: false,
      message: "Bulk upload failed",
      error: error.message 
    });
  }
};
