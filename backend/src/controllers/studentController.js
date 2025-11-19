import Student from "../models/Student.js";
import Payment from "../models/Payment.js";

export const addStudent = async (req, res) => {
  try {
  const { name, email, phone, gender, course, batch, address, fees, password } = req.body;

    // Tenant comes from JWT
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(403).json({ message: "Tenant ID missing" });
    }
    
    // Generate a random password if not provided
    const studentPassword = password || Math.random().toString(36).slice(-8);

    // Generate roll number: BATCH/XXX (e.g., 202526/001)
    // batch field is expected to be like "202526" or "2025-26", we'll clean it
    const batchKey = (batch || "").toString().replace(/[^0-9]/g, ""); // Remove non-numeric chars

    // Count existing students for same tenant + batch to generate sequence
    const existingCount = await Student.countDocuments({ tenantId, batch: batchKey });
    const seq = existingCount + 1;
    const seqStr = String(seq).padStart(3, "0");
    const rollNumber = `${batchKey}/${seqStr}`;

    const newStudent = await Student.create({
      tenantId,
      name,
      email,
      phone,
      gender,
      course,
      batch: batchKey,
      address: address || "",
      fees: fees ? Number(fees) : 0,
      balance: 0,
      password: studentPassword, // Always set password (will be hashed by pre-save hook)
      rollNumber,
    });
    
    console.log(`✅ Student created: ${newStudent.name} | Email: ${newStudent.email} | Password: ${password ? '(provided)' : studentPassword}`);

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      student: newStudent,
      // If password was auto-generated, return it so admin can share
      ...(password ? {} : { generatedPassword: studentPassword })
    });
  } catch (err) {
    console.error("Add student error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudents = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    // Filters & pagination
    const { page = 1, limit = 10, batch, course, rollNumber, feesStatus } = req.query;
    const pageNum = Number(page) || 1;
    const lim = Math.min(Number(limit) || 10, 100);

    const match = { tenantId };
    if (batch) match.batch = batch;
    if (course) match.course = course;
    if (rollNumber) match.rollNumber = rollNumber;

    // Build aggregation to support fees-based filters and pagination
    const pipeline = [{ $match: match }];

    if (feesStatus === "paid_gt_50") {
      pipeline.push({
        $match: {
          $expr: {
            $gt: [
              { $cond: [{ $gt: ["$fees", 0] }, { $divide: ["$balance", "$fees"] }, 0] },
              0.5,
            ],
          },
        },
      });
    } else if (feesStatus === "remaining_gt_50") {
      pipeline.push({
        $match: {
          $expr: {
            $gt: [
              { $cond: [{ $gt: ["$fees", 0] }, { $divide: [{ $subtract: ["$fees", "$balance"] }, "$fees"] }, 0] },
              0.5,
            ],
          },
        },
      });
    }

    // Count total matching
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Student.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add sort, skip, limit
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: (pageNum - 1) * lim });
    pipeline.push({ $limit: lim });

    const students = await Student.aggregate(pipeline);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim) || 1,
      count: students.length,
      students,
    });
  } catch (err) {
    console.error("Get students error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const student = await Student.findOne({ _id: id, tenantId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // fetch payments for this student
    const payments = await Payment.find({ tenantId, studentId: student._id }).sort({ date: -1 });

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
    const allowed = ["name", "email", "phone", "gender", "course", "batch", "address", "fees", "status"];
    const payload = {};
    allowed.forEach((k) => {
      if (updates[k] !== undefined) payload[k] = updates[k];
    });

    // Ensure fees and balance are numeric
    if (payload.fees !== undefined) payload.fees = Number(payload.fees);

    const student = await Student.findOneAndUpdate({ _id: id, tenantId }, { $set: payload }, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json({ success: true, student });
  } catch (err) {
    console.error("Update student error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

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

        // Generate roll number
        const batchKey = (batch || "").toString().replace(/[^0-9]/g, "");
        const existingCount = await Student.countDocuments({ tenantId, batch: batchKey });
        const seq = existingCount + 1;
        const seqStr = String(seq).padStart(3, "0");
        const rollNumber = `${batchKey}/${seqStr}`;

        // Create student
        const newStudent = await Student.create({
          tenantId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone || "",
          gender: gender || "Other",
          course: course || "",
          batch: batchKey,
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
