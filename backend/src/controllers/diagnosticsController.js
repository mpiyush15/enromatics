/**
 * Diagnostics Controller
 * Helps identify and fix data sync issues between student records, tests, and marks
 */

export const diagnoseStudentData = async (req, res) => {
  try {
    const { tenantId, studentId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId required" });
    }

    const Student = await import("../models/Student.js");
    const Test = await import("../models/Test.js");
    const TestMarks = await import("../models/TestMarks.js");
    const Batch = await import("../models/Batch.js");

    // If specific student ID provided, diagnose that student
    if (studentId) {
      const student = await Student.default.findById(studentId);
      if (!student || student.tenantId !== tenantId) {
        return res.status(404).json({ message: "Student not found" });
      }

      const diagnosis = await diagnoseSingleStudent(student, Test, TestMarks, Batch);
      return res.json({ success: true, diagnosis });
    }

    // Otherwise, diagnose all students in tenant
    const students = await Student.default.find({ tenantId }).lean();
    
    const diagnoses = await Promise.all(
      students.map(student => diagnoseSingleStudent(student, Test, TestMarks, Batch))
    );

    const summary = {
      totalStudents: students.length,
      issues: {
        missingBatch: diagnoses.filter(d => d.hasMissingBatch).length,
        noTests: diagnoses.filter(d => d.testsFound === 0).length,
        noMarks: diagnoses.filter(d => d.noMarksFound).length,
        mismatchedData: diagnoses.filter(d => d.mismatchIssues.length > 0).length,
      },
      details: diagnoses,
    };

    res.json({ success: true, summary });
  } catch (error) {
    console.error("Diagnosis error:", error);
    res.status(500).json({ message: error.message });
  }
};

async function diagnoseSingleStudent(student, Test, TestMarks, Batch) {
  try {
    // 1. Check batch sync
    let batchName = student.batch;
    let hasMissingBatch = !batchName || batchName === '';
    
    if (student.batchId) {
      const batch = await Batch.default.findById(student.batchId).lean();
      if (batch && batch.name !== batchName) {
        hasMissingBatch = true;
        batchName = batch.name;
      }
    }

    // 2. Find tests for this student's course/batch
    const testsQuery = {
      tenantId: student.tenantId,
      course: student.course,
      batch: batchName,
    };

    const tests = await Test.default.find(testsQuery).select('_id name subject testDate').lean();

    // 3. Check marks for each test
    const marksInfo = await Promise.all(
      tests.map(async (test) => {
        const marks = await TestMarks.default.findOne({
          tenantId: student.tenantId,
          testId: test._id,
          studentId: student._id,
        }).lean();

        return {
          testId: test._id,
          testName: test.name,
          hasMarks: !!marks,
          marks: marks ? {
            marksObtained: marks.marksObtained,
            totalMarks: marks.totalMarks,
          } : null,
        };
      })
    );

    const noMarksFound = marksInfo.filter(m => !m.hasMarks).length > 0;
    const mismatchIssues = [];

    if (hasMissingBatch) {
      mismatchIssues.push(`Batch mismatch: DB has "${student.batch}", should be "${batchName}"`);
    }

    if (student.course && !tests.length) {
      mismatchIssues.push(`No tests found for course "${student.course}" and batch "${batchName}"`);
    }

    if (noMarksFound) {
      const testNamesWithoutMarks = marksInfo.filter(m => !m.hasMarks).map(m => m.testName).join(", ");
      mismatchIssues.push(`Missing marks for tests: ${testNamesWithoutMarks}`);
    }

    return {
      studentId: student._id.toString(),
      studentName: student.name,
      email: student.email,
      course: student.course,
      batch: student.batch,
      batchId: student.batchId?.toString(),
      resolvedBatch: batchName,
      hasMissingBatch,
      testsFound: tests.length,
      marksStatus: marksInfo,
      noMarksFound,
      mismatchIssues,
      isHealthy: !hasMissingBatch && tests.length > 0 && !noMarksFound,
    };
  } catch (error) {
    console.error(`Error diagnosing student ${student._id}:`, error);
    return {
      studentId: student._id.toString(),
      studentName: student.name,
      error: error.message,
    };
  }
}

/**
 * Fix batch sync for all students in a tenant
 */
export const fixBatchSync = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId required" });
    }

    const Student = await import("../models/Student.js");
    const Batch = await import("../models/Batch.js");

    const students = await Student.default.find({ tenantId });
    const results = { fixed: 0, errors: [] };

    for (const student of students) {
      try {
        if (student.batchId) {
          const batch = await Batch.default.findById(student.batchId).select('name');
          if (batch && batch.name !== student.batch) {
            // Update the batch field
            await Student.default.findByIdAndUpdate(
              student._id,
              { batch: batch.name },
              { new: false }
            );
            results.fixed++;
            console.log(`✅ Fixed batch for ${student.name}: ${student.batch} → ${batch.name}`);
          }
        }
      } catch (err) {
        results.errors.push({
          studentId: student._id,
          studentName: student.name,
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Fixed ${results.fixed} students`,
      results,
    });
  } catch (error) {
    console.error("Fix batch sync error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all tests for a student with their marks
 */
export const getStudentTestsWithMarks = async (req, res) => {
  try {
    const { tenantId, studentId } = req.params;

    const Student = await import("../models/Student.js");
    const Test = await import("../models/Test.js");
    const TestMarks = await import("../models/TestMarks.js");
    const Batch = await import("../models/Batch.js");

    const student = await Student.default.findById(studentId);
    if (!student || student.tenantId !== tenantId) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Resolve batch name
    let batchName = student.batch;
    if (student.batchId) {
      const batch = await Batch.default.findById(student.batchId).lean();
      if (batch) batchName = batch.name;
    }

    // Find all tests for this course/batch
    const tests = await Test.default.find({
      tenantId,
      course: student.course,
      batch: batchName,
    }).sort({ testDate: -1 }).lean();

    // Fetch marks for each test
    const testsWithMarks = await Promise.all(
      tests.map(async (test) => {
        const marks = await TestMarks.default.findOne({
          tenantId,
          testId: test._id,
          studentId: student._id,
        }).lean();

        return {
          ...test,
          marksObtained: marks?.marksObtained || 0,
          totalMarks: marks?.totalMarks || test.totalMarks || 100,
          percentage: marks ? ((marks.marksObtained / (marks.totalMarks || test.totalMarks || 100)) * 100).toFixed(1) : 0,
          passed: marks ? (marks.marksObtained >= 50) : false,
          marks,
        };
      })
    );

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        course: student.course,
        batch: batchName,
      },
      count: testsWithMarks.length,
      tests: testsWithMarks,
    });
  } catch (error) {
    console.error("Error fetching tests with marks:", error);
    res.status(500).json({ message: error.message });
  }
};
