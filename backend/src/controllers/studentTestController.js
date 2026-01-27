import Test from "../models/Test.js";
import TestMarks from "../models/TestMarks.js";

/**
 * Get student's tests
 * @route GET /api/student/tests
 * @access Student only
 */
export const getStudentTests = async (req, res) => {
  try {
    const studentId = req.student._id;
    const tenantId = req.student.tenantId;
    const course = req.student.course;
    const batch = req.student.batch;

    console.log("📚 Student fetching their tests:", {
      studentId,
      tenantId,
      course,
      batch
    });

    // Get all tests for this student's batch and course
    const tests = await Test.find({
      tenantId,
      course,
      batch,
      status: { $ne: "deleted" }
    }).sort({ testDate: -1 });

    console.log(`✅ Found ${tests.length} tests for student`);

    // Fetch marks for each test
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
              
              // Calculate percentage
              const percentage = (studentMark.marks / test.totalMarks) * 100;
              testObj.myPercentage = Math.round(percentage * 100) / 100;
              testObj.myGrade = getGrade(percentage);
              
              // Calculate rank
              const betterScores = marksDoc.students.filter(
                s => s.marks > studentMark.marks
              ).length;
              testObj.myRank = betterScores + 1;
              testObj.totalStudents = marksDoc.students.length;
            }
          }
        } catch (err) {
          console.error(`⚠️ Error fetching marks for test:`, err.message);
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
    console.error("Error fetching student tests:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tests"
    });
  }
};

/**
 * Get student's marks for a specific test
 */
export const getStudentTestMarks = async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.student._id;

    const marksDoc = await TestMarks.findOne({
      test: testId,
      "students.studentId": studentId
    }).populate("test");

    if (!marksDoc) {
      return res.status(404).json({
        success: false,
        message: "Marks not found for this test"
      });
    }

    const studentMark = marksDoc.students.find(
      s => s.studentId.toString() === studentId.toString()
    );

    if (!studentMark) {
      return res.status(404).json({
        success: false,
        message: "Your marks not found"
      });
    }

    res.status(200).json({
      success: true,
      test: marksDoc.test,
      marks: studentMark.marks,
      attendance: studentMark.attendance,
      totalMarks: marksDoc.test.totalMarks
    });
  } catch (error) {
    console.error("Error fetching student marks:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch marks"
    });
  }
};

function getGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}
