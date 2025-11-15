import Test from "../models/Test.js";
import TestAttendance from "../models/TestAttendance.js";
import TestMarks from "../models/TestMarks.js";
import Student from "../models/Student.js";

// @desc    Create a new test
// @route   POST /api/academics/tests
// @access  Private (tenantAdmin, teacher, staff)
export const createTest = async (req, res) => {
  try {
    const { name, subject, course, batch, testDate, duration, totalMarks, passingMarks, testType, description } = req.body;
    const tenantId = req.user.tenantId;

    const test = await Test.create({
      tenantId,
      name,
      subject,
      course,
      batch,
      testDate,
      duration,
      totalMarks,
      passingMarks,
      testType,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      test,
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create test",
    });
  }
};

// @desc    Get all tests for a tenant
// @route   GET /api/academics/tests
// @access  Private
export const getTests = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { course, batch, status, startDate, endDate } = req.query;

    let query = { tenantId };

    if (course) query.course = course;
    if (batch) query.batch = batch;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.testDate = {};
      if (startDate) query.testDate.$gte = new Date(startDate);
      if (endDate) query.testDate.$lte = new Date(endDate);
    }

    const tests = await Test.find(query)
      .populate("createdBy", "name email")
      .sort({ testDate: -1 });

    res.status(200).json({
      success: true,
      count: tests.length,
      tests,
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tests",
    });
  }
};

// @desc    Get single test by ID
// @route   GET /api/academics/tests/:id
// @access  Private
export const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check tenant access
    if (test.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      test,
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch test",
    });
  }
};

// @desc    Update test
// @route   PUT /api/academics/tests/:id
// @access  Private (tenantAdmin, teacher, staff)
export const updateTest = async (req, res) => {
  try {
    let test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check tenant access
    if (test.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Test updated successfully",
      test,
    });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update test",
    });
  }
};

// @desc    Delete test
// @route   DELETE /api/academics/tests/:id
// @access  Private (tenantAdmin)
export const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Check tenant access
    if (test.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await Test.findByIdAndDelete(req.params.id);

    // Also delete related attendance and marks
    await TestAttendance.deleteMany({ testId: req.params.id });
    await TestMarks.deleteMany({ testId: req.params.id });

    res.status(200).json({
      success: true,
      message: "Test and related data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete test",
    });
  }
};

// @desc    Mark attendance for a test
// @route   POST /api/academics/tests/:id/attendance
// @access  Private (tenantAdmin, teacher, staff)
export const markAttendance = async (req, res) => {
  try {
    const { attendanceData } = req.body; // Array of { studentId, present, remarks }
    const testId = req.params.id;
    const tenantId = req.user.tenantId;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Bulk upsert attendance records
    const bulkOps = attendanceData.map((record) => ({
      updateOne: {
        filter: { testId, studentId: record.studentId },
        update: {
          $set: {
            tenantId,
            present: record.present,
            remarks: record.remarks || "",
            markedBy: req.user._id,
            markedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    await TestAttendance.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark attendance",
    });
  }
};

// @desc    Get attendance for a test
// @route   GET /api/academics/tests/:id/attendance
// @access  Private
export const getTestAttendance = async (req, res) => {
  try {
    const testId = req.params.id;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const attendance = await TestAttendance.find({ testId })
      .populate("studentId", "name rollNumber email course batch")
      .populate("markedBy", "name email");

    res.status(200).json({
      success: true,
      test,
      attendance,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attendance",
    });
  }
};

// @desc    Enter marks for a test
// @route   POST /api/academics/tests/:id/marks
// @access  Private (tenantAdmin, teacher, staff)
export const enterMarks = async (req, res) => {
  try {
    const { marksData } = req.body; // Array of { studentId, marksObtained, remarks }
    const testId = req.params.id;
    const tenantId = req.user.tenantId;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Bulk upsert marks records
    const bulkOps = marksData.map((record) => ({
      updateOne: {
        filter: { testId, studentId: record.studentId },
        update: {
          $set: {
            tenantId,
            marksObtained: record.marksObtained,
            remarks: record.remarks || "",
            enteredBy: req.user._id,
            enteredAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    await TestMarks.bulkWrite(bulkOps);

    // Fetch updated marks to return with calculated fields
    const marks = await TestMarks.find({ testId })
      .populate("studentId", "name rollNumber email course batch");

    res.status(200).json({
      success: true,
      message: "Marks entered successfully",
      marks,
    });
  } catch (error) {
    console.error("Error entering marks:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to enter marks",
    });
  }
};

// @desc    Get marks for a test
// @route   GET /api/academics/tests/:id/marks
// @access  Private
export const getTestMarks = async (req, res) => {
  try {
    const testId = req.params.id;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const marks = await TestMarks.find({ testId })
      .populate("studentId", "name rollNumber email course batch")
      .populate("enteredBy", "name email")
      .sort({ "studentId.rollNumber": 1 });

    // Calculate statistics
    const totalStudents = marks.length;
    const passedStudents = marks.filter((m) => m.passed).length;
    const avgMarks = totalStudents > 0 
      ? marks.reduce((sum, m) => sum + m.marksObtained, 0) / totalStudents 
      : 0;
    const highestMarks = totalStudents > 0 
      ? Math.max(...marks.map((m) => m.marksObtained)) 
      : 0;

    res.status(200).json({
      success: true,
      test,
      marks,
      statistics: {
        totalStudents,
        passedStudents,
        failedStudents: totalStudents - passedStudents,
        avgMarks: avgMarks.toFixed(2),
        highestMarks,
        passPercentage: totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching marks:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch marks",
    });
  }
};

// @desc    Get student's test history
// @route   GET /api/academics/students/:studentId/tests
// @access  Private
export const getStudentTests = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const tenantId = req.user.tenantId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get all marks for the student
    const marks = await TestMarks.find({ studentId, tenantId })
      .populate("testId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      student,
      tests: marks,
    });
  } catch (error) {
    console.error("Error fetching student tests:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch student tests",
    });
  }
};

// @desc    Get test reports/analytics
// @route   GET /api/academics/reports
// @access  Private
export const getReports = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { course, batch, startDate, endDate } = req.query;

    let testQuery = { tenantId };
    if (course) testQuery.course = course;
    if (batch) testQuery.batch = batch;
    if (startDate || endDate) {
      testQuery.testDate = {};
      if (startDate) testQuery.testDate.$gte = new Date(startDate);
      if (endDate) testQuery.testDate.$lte = new Date(endDate);
    }

    const tests = await Test.find(testQuery);
    const testIds = tests.map((t) => t._id);

    // Get all marks for these tests
    const allMarks = await TestMarks.find({ testId: { $in: testIds } })
      .populate("studentId", "name rollNumber course batch")
      .populate("testId", "name subject totalMarks");

    // Calculate overall statistics
    const totalTests = tests.length;
    const totalMarksRecords = allMarks.length;
    const avgPercentage = totalMarksRecords > 0
      ? allMarks.reduce((sum, m) => sum + m.percentage, 0) / totalMarksRecords
      : 0;
    const passedCount = allMarks.filter((m) => m.passed).length;

    // Top performers
    const topPerformers = allMarks
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10)
      .map((m) => ({
        student: m.studentId,
        test: m.testId,
        percentage: m.percentage,
        grade: m.grade,
      }));

    // Subject-wise performance
    const subjectPerformance = {};
    tests.forEach((test) => {
      if (!subjectPerformance[test.subject]) {
        subjectPerformance[test.subject] = {
          subject: test.subject,
          testCount: 0,
          avgPercentage: 0,
          totalMarks: [],
        };
      }
      subjectPerformance[test.subject].testCount++;
    });

    allMarks.forEach((mark) => {
      const subject = mark.testId.subject;
      if (subjectPerformance[subject]) {
        subjectPerformance[subject].totalMarks.push(mark.percentage);
      }
    });

    Object.keys(subjectPerformance).forEach((subject) => {
      const data = subjectPerformance[subject];
      data.avgPercentage = data.totalMarks.length > 0
        ? (data.totalMarks.reduce((a, b) => a + b, 0) / data.totalMarks.length).toFixed(2)
        : 0;
      delete data.totalMarks;
    });

    res.status(200).json({
      success: true,
      statistics: {
        totalTests,
        totalMarksRecords,
        avgPercentage: avgPercentage.toFixed(2),
        passPercentage: totalMarksRecords > 0 ? ((passedCount / totalMarksRecords) * 100).toFixed(2) : 0,
      },
      topPerformers,
      subjectPerformance: Object.values(subjectPerformance),
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reports",
    });
  }
};

// @desc    Get tests for student (filtered by course and batch)
// @route   GET /api/academics/student/tests
// @access  Private (Student)
export const getTestsForStudent = async (req, res) => {
  try {
    const student = req.student; // Set by protectStudent middleware
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Student not authenticated",
      });
    }

    // Fetch tests for student's course, batch, and tenant
    const query = {
      tenantId: student.tenantId,
      course: student.course,
      batch: student.batch,
    };

    const tests = await Test.find(query)
      .populate("createdBy", "name email")
      .sort({ testDate: -1 });

    res.status(200).json({
      success: true,
      count: tests.length,
      tests,
    });
  } catch (error) {
    console.error("Error fetching tests for student:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tests",
    });
  }
};
