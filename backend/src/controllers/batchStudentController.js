import mongoose from "mongoose";
import BatchStudent from "../models/BatchStudent.js";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";

/**
 * Get all students in a batch
 * GET /api/batches/:batchId/students
 */
export const getBatchStudents = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { batchId } = req.params;
    const { page = 1, limit = 10, status = "active" } = req.query;

    if (!batchId) {
      return res.status(400).json({ message: "Batch ID required" });
    }

    // Verify batch exists and belongs to tenant
    const batch = await Batch.findOne({
      _id: batchId,
      tenantId,
    }).lean();

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Verify status is valid
    const validStatuses = ["active", "inactive", "completed", "removed"];
    const statusFilter = status && validStatuses.includes(status) ? status : "active";

    const pageNum = Number(page);
    const lim = Math.min(Number(limit), 100);

    // Find BatchStudent mappings
    const batchStudents = await BatchStudent.find({
      tenantId,
      batchId,
      status: statusFilter,
    })
      .populate("studentId", "name email phone gender course rollNumber status")
      .sort({ joinedAt: -1 })
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .lean();

    const total = await BatchStudent.countDocuments({
      tenantId,
      batchId,
      status: statusFilter,
    });

    // Transform response
    const students = batchStudents.map((bs) => ({
      ...bs.studentId,
      batchStudentId: bs._id,
      joinedAt: bs.joinedAt,
      status: bs.studentId.status,
    }));

    console.log(`✅ Found ${students.length} students in batch ${batch.name}`);

    res.json({
      success: true,
      batch: {
        _id: batch._id,
        name: batch.name,
      },
      students,
      page: pageNum,
      pages: Math.ceil(total / lim) || 1,
      total,
    });
  } catch (err) {
    console.error("❌ Get batch students error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

/**
 * Add student to batch
 * POST /api/batches/:batchId/students
 */
export const addStudentToBatch = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { batchId } = req.params;
    const { studentId, status = "active", notes = "" } = req.body;

    if (!batchId || !studentId) {
      return res
        .status(400)
        .json({ message: "Batch ID and Student ID required" });
    }

    // Verify batch exists
    const batch = await Batch.findOne({
      _id: batchId,
      tenantId,
    }).lean();

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Verify student exists
    const student = await Student.findOne({
      _id: studentId,
      tenantId,
    }).lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if already exists
    const existing = await BatchStudent.findOne({
      tenantId,
      studentId,
      batchId,
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Student already in this batch" });
    }

    // Create mapping
    const batchStudent = await BatchStudent.create({
      tenantId,
      studentId,
      batchId,
      status,
      notes,
      joinedAt: new Date(),
    });

    console.log(
      `✅ Added student ${student.name} to batch ${batch.name}`
    );

    res.status(201).json({
      success: true,
      message: "Student added to batch",
      batchStudent,
    });
  } catch (err) {
    console.error("❌ Add student to batch error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

/**
 * Remove student from batch
 * DELETE /api/batches/:batchId/students/:studentId
 */
export const removeStudentFromBatch = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { batchId, studentId } = req.params;

    if (!batchId || !studentId) {
      return res
        .status(400)
        .json({ message: "Batch ID and Student ID required" });
    }

    // Find and update status to "removed"
    const batchStudent = await BatchStudent.findOneAndUpdate(
      {
        tenantId,
        batchId,
        studentId,
      },
      {
        status: "removed",
        removedAt: new Date(),
      },
      { new: true }
    );

    if (!batchStudent) {
      return res
        .status(404)
        .json({ message: "Student not found in this batch" });
    }

    console.log(`✅ Removed student from batch`);

    res.json({
      success: true,
      message: "Student removed from batch",
      batchStudent,
    });
  } catch (err) {
    console.error("❌ Remove student from batch error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

/**
 * Get all batches for a student
 * GET /api/students/:studentId/batches
 */
export const getStudentBatches = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { studentId } = req.params;
    const { status = "active" } = req.query;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID required" });
    }

    // Verify student exists
    const student = await Student.findOne({
      _id: studentId,
      tenantId,
    }).lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find all batch mappings
    const validStatuses = ["active", "inactive", "completed", "removed"];
    const statusFilter = status && validStatuses.includes(status) ? status : "active";

    const batchMappings = await BatchStudent.find({
      tenantId,
      studentId,
      status: statusFilter,
    })
      .populate("batchId", "name courseId startDate endDate status")
      .sort({ joinedAt: -1 })
      .lean();

    const batches = batchMappings.map((bm) => ({
      ...bm.batchId,
      joinedAt: bm.joinedAt,
      batchStudentStatus: bm.status,
    }));

    console.log(`✅ Found ${batches.length} batches for student ${student.name}`);

    res.json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
      },
      batches,
      total: batches.length,
    });
  } catch (err) {
    console.error("❌ Get student batches error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

/**
 * Add student to multiple batches (bulk)
 * POST /api/students/:studentId/batches
 */
export const addStudentToMultipleBatches = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { studentId } = req.params;
    const { batchIds = [] } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID required" });
    }

    if (!Array.isArray(batchIds) || batchIds.length === 0) {
      return res.status(400).json({ message: "Batch IDs array required" });
    }

    // Verify student exists
    const student = await Student.findOne({
      _id: studentId,
      tenantId,
    }).lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify all batches exist
    const batches = await Batch.find({
      _id: { $in: batchIds },
      tenantId,
    }).lean();

    if (batches.length !== batchIds.length) {
      return res.status(404).json({ message: "Some batches not found" });
    }

    // Create mappings
    const mappings = batchIds.map((batchId) => ({
      tenantId,
      studentId,
      batchId,
      status: "active",
      joinedAt: new Date(),
    }));

    // Use insertMany with ordered: false to skip duplicates
    const result = await BatchStudent.insertMany(mappings, { ordered: false }).catch(
      (err) => {
        // Ignore duplicate key errors
        if (err.code === 11000) {
          return err.insertedDocs || [];
        }
        throw err;
      }
    );

    console.log(
      `✅ Added student ${student.name} to ${result.length} batches`
    );

    res.status(201).json({
      success: true,
      message: `Student added to ${result.length} batches`,
      count: result.length,
    });
  } catch (err) {
    console.error("❌ Add student to multiple batches error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
