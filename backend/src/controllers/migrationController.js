import Student from "../models/Student.js";
import Batch from "../models/Batch.js";

/**
 * Migration script to fix scholarship-enrolled students:
 * 1. Fix negative balance (set to 0)
 * 2. Generate roll numbers for students without one
 */
export const fixScholarshipStudents = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: "Tenant ID missing" });
    }

    console.log('[FIX SCHOLARSHIP STUDENTS] Starting migration for tenant:', tenantId);

    // Find all students with negative balance OR without roll number
    const studentsToFix = await Student.find({
      tenantId,
      $or: [
        { balance: { $lt: 0 } },
        { rollNumber: { $exists: false } },
        { rollNumber: null },
        { rollNumber: '' }
      ]
    });

    console.log(`[FIX] Found ${studentsToFix.length} students to fix`);

    const fixedStudents = [];
    const errors = [];

    for (const student of studentsToFix) {
      try {
        const updates = {};
        let needsUpdate = false;

        // Fix negative balance
        if (student.balance < 0) {
          updates.balance = 0;
          needsUpdate = true;
          console.log(`[FIX] Student ${student._id}: Fixing negative balance (${student.balance} → 0)`);
        }

        // Generate roll number if missing
        if (!student.rollNumber || student.rollNumber === '') {
          if (student.batchId) {
            // Fetch batch to get prefix
            const batch = await Batch.findById(student.batchId);
            if (batch) {
              const currentYear = new Date().getFullYear();
              const batchPrefix = batch.name.substring(0, 2).toUpperCase();
              
              // Count students in this batch admitted in the current year
              const seq = (await Student.countDocuments({ 
                tenantId, 
                batchId: student.batchId,
                rollNumber: { $exists: true, $ne: null, $ne: '' },
                createdAt: {
                  $gte: new Date(`${currentYear}-01-01`),
                  $lt: new Date(`${currentYear + 1}-01-01`)
                }
              })) + 1;
              
              const rollNumber = `${currentYear}${batchPrefix}${String(seq).padStart(3, "0")}`;
              updates.rollNumber = rollNumber;
              needsUpdate = true;
              console.log(`[FIX] Student ${student._id}: Generated roll number: ${rollNumber}`);
            } else {
              console.warn(`[FIX] Student ${student._id}: Batch not found (${student.batchId})`);
              errors.push({
                studentId: student._id,
                name: student.name,
                error: 'Batch not found'
              });
            }
          } else {
            console.warn(`[FIX] Student ${student._id}: No batch assigned, cannot generate roll number`);
            errors.push({
              studentId: student._id,
              name: student.name,
              error: 'No batch assigned'
            });
          }
        }

        // Apply updates
        if (needsUpdate) {
          await Student.findByIdAndUpdate(student._id, { $set: updates });
          fixedStudents.push({
            studentId: student._id,
            name: student.name,
            updates
          });
          console.log(`[FIX] Student ${student._id} (${student.name}): Updated successfully`, updates);
        }
      } catch (err) {
        console.error(`[FIX ERROR] Failed to fix student ${student._id}:`, err);
        errors.push({
          studentId: student._id,
          name: student.name,
          error: err.message
        });
      }
    }

    console.log('[FIX SCHOLARSHIP STUDENTS] Migration complete');
    console.log(`[FIX] Fixed: ${fixedStudents.length} students`);
    console.log(`[FIX] Errors: ${errors.length} students`);

    res.status(200).json({
      success: true,
      message: 'Scholarship students migration completed',
      summary: {
        totalFound: studentsToFix.length,
        fixed: fixedStudents.length,
        errors: errors.length
      },
      fixedStudents,
      errors
    });
  } catch (err) {
    console.error("[FIX SCHOLARSHIP STUDENTS ERROR]", err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};
