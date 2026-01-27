import Test from "../models/Test.js";
import TestMarks from "../models/TestMarks.js";
import Student from "../models/Student.js";

/**
 * Get student's assigned tests
 * @route GET /api/student/dashboard/tests
 * @access Student only
 */
export const getMyTests = async (req, res) => {
  try {
    const studentId = req.user._id;
    const tenantId = req.user.tenantId;
    const course = req.user.course;
    const batch = req.user.batch;

    console.log("📚 Fetching tests for student:", {
      studentId,
      tenantId,
      course,
      batch
    });

    if (!course || !batch) {
      return res.status(400).json({
        success: false,
        message: "Student course or batch not set",
        tests: []
      });
    }

    // Get all tests for this student's batch and course
    const tests = await Test.find({
      tenantId,
      course,
      batch,
      status: { $ne: "deleted" }
    }).sort({ testDate: -1 });

    console.log(`✅ Found ${tests.length} tests for student`);

    // For each test, fetch the student's marks
    const testsWithMarks = await Promise.all(
      tests.map(async (test) => {
        const testObj = test.toObject();
        
        try {
          const marksDoc = await TestMarks.findOne({
            test: test._id,
            "students.studentId": studentId
          });

          if (marksDoc) {
            const studentMark = marksDoc.students.find(
              s => s.studentId.toString() === studentId.toString()
            );
            
            if (studentMark) {
              testObj.myMarks = studentMark.marks;
              testObj.myAttendance = studentMark.attendance;
              
              // Calculate percentage and grade
              const percentage = (studentMark.marks / test.totalMarks) * 100;
              testObj.myPercentage = Math.round(percentage * 100) / 100;
              testObj.myGrade = getGrade(percentage);
              
              // Calculate rank (count how many scored more)
              const betterScores = marksDoc.students.filter(
                s => s.marks > studentMark.marks
              ).length;
              testObj.myRank = betterScores + 1;
              testObj.totalStudents = marksDoc.students.length;
            }
          }
        } catch (err) {
          console.error(`⚠️ Error fetching marks for test ${test._id}:`, err.message);
        }

        return testObj;
      })
    );

    res.status(200).json({
      success: true,
      count: testsWithMarks.length,
      tests: testsWithMarks
    });
  } catch (error) {
    console.error("❌ Error fetching student tests:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tests",
      tests: []
    });
  }
};

/**
 * Get student's marks for a specific test
 * @route GET /api/student/dashboard/tests/:testId/marks
 * @access Student only
 */
export const getMyMarks = async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user._id;

    console.log("📊 Fetching marks for test:", testId, "student:", studentId);

    const marksDoc = await TestMarks.findOne({
      test: testId,
      "students.studentId": studentId
    }).populate("test");

    if (!marksDoc) {
      return res.status(200).json({
        success: false,
        message: "Marks not found",
        marks: null
      });
    }

    const studentMark = marksDoc.students.find(
      s => s.studentId.toString() === studentId.toString()
    );

    if (!studentMark) {
      return res.status(200).json({
        success: false,
        message: "Student marks not found",
        marks: null
      });
    }

    const test = marksDoc.test;
    const percentage = (studentMark.marks / test.totalMarks) * 100;

    res.status(200).json({
      success: true,
      marks: {
        test: test.name,
        testId: test._id,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks,
        myMarks: studentMark.marks,
        percentage: Math.round(percentage * 100) / 100,
        grade: getGrade(percentage),
        passed: studentMark.marks >= test.passingMarks,
        rank: marksDoc.students.filter(s => s.marks > studentMark.marks).length + 1,
        totalStudents: marksDoc.students.length,
        testDate: test.testDate,
        testType: test.testType
      }
    });
  } catch (error) {
    console.error("❌ Error fetching student marks:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch marks"
    });
  }
};

/**
 * Get student's performance reports
 * @route GET /api/student/dashboard/reports
 * @access Student only
 */
export const getMyReports = async (req, res) => {
  try {
    const studentId = req.user._id;
    const tenantId = req.user.tenantId;
    const course = req.user.course;
    const batch = req.user.batch;

    console.log("📈 Generating reports for student:", studentId);

    // Get all tests for this student's batch
    const tests = await Test.find({
      tenantId,
      course,
      batch,
      status: { $ne: "deleted" }
    }).sort({ testDate: -1 });

    const allMarks = [];
    let totalTests = 0;
    let passedTests = 0;
    let totalMarksScored = 0;
    let totalMarksAvailable = 0;

    // Fetch marks for each test
    for (const test of tests) {
      try {
        const marksDoc = await TestMarks.findOne({
          test: test._id,
          "students.studentId": studentId
        });

        if (marksDoc) {
          const studentMark = marksDoc.students.find(
            s => s.studentId.toString() === studentId.toString()
          );

          if (studentMark) {
            totalTests++;
            const percentage = (studentMark.marks / test.totalMarks) * 100;

            if (studentMark.marks >= test.passingMarks) {
              passedTests++;
            }

            totalMarksScored += studentMark.marks;
            totalMarksAvailable += test.totalMarks;

            allMarks.push({
              testName: test.name,
              marks: studentMark.marks,
              totalMarks: test.totalMarks,
              percentage: Math.round(percentage * 100) / 100,
              testDate: test.testDate,
              passed: studentMark.marks >= test.passingMarks
            });
          }
        }
      } catch (err) {
        console.error(`⚠️ Error fetching marks for test ${test._id}:`, err.message);
      }
    }

    const overallPercentage = totalMarksAvailable > 0 
      ? Math.round((totalMarksScored / totalMarksAvailable) * 100 * 100) / 100
      : 0;

    res.status(200).json({
      success: true,
      report: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        passPercentage: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
        overallPercentage,
        overallGrade: getGrade(overallPercentage),
        totalMarksScored,
        totalMarksAvailable,
        marks: allMarks,
        bestTest: allMarks.length > 0 ? allMarks.reduce((a, b) => a.percentage > b.percentage ? a : b) : null,
        worstTest: allMarks.length > 0 ? allMarks.reduce((a, b) => a.percentage < b.percentage ? a : b) : null
      }
    });
  } catch (error) {
    console.error("❌ Error generating reports:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate reports"
    });
  }
};

/**
 * Get student's attendance
 * @route GET /api/student/dashboard/attendance
 * @access Student only
 */
export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;
    const tenantId = req.user.tenantId;
    const course = req.user.course;
    const batch = req.user.batch;

    console.log("📅 Fetching attendance for student:", studentId);

    // Get all tests for this student's batch
    const tests = await Test.find({
      tenantId,
      course,
      batch,
      status: { $ne: "deleted" }
    }).sort({ testDate: -1 });

    let presentCount = 0;
    let absentCount = 0;
    const attendanceDetails = [];

    // Fetch marks/attendance for each test
    for (const test of tests) {
      try {
        const marksDoc = await TestMarks.findOne({
          test: test._id,
          "students.studentId": studentId
        });

        if (marksDoc) {
          const studentMark = marksDoc.students.find(
            s => s.studentId.toString() === studentId.toString()
          );

          if (studentMark) {
            const attendance = studentMark.attendance || "absent";
            if (attendance === "present") presentCount++;
            else absentCount++;

            attendanceDetails.push({
              testName: test.name,
              testDate: test.testDate,
              attendance: attendance,
              marks: studentMark.marks,
              totalMarks: test.totalMarks
            });
          }
        }
      } catch (err) {
        console.error(`⚠️ Error fetching attendance for test ${test._id}:`, err.message);
      }
    }

    const totalTests = presentCount + absentCount;
    const attendancePercentage = totalTests > 0 
      ? Math.round((presentCount / totalTests) * 100)
      : 0;

    res.status(200).json({
      success: true,
      attendance: {
        totalTests,
        presentCount,
        absentCount,
        attendancePercentage,
        details: attendanceDetails
      }
    });
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attendance"
    });
  }
};

/**
 * Helper function to get grade from percentage
 */
function getGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "D";
}
