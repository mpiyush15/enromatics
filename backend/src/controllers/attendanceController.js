import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

// Mark attendance for one or multiple students
export const markAttendance = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { records } = req.body; // Array of { studentId, date, status, remarks }
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "Records array is required" });
    }

    const bulkOps = records.map(({ studentId, date, status, remarks }) => ({
      updateOne: {
        filter: { tenantId, studentId, date: new Date(date) },
        update: {
          $set: {
            status: status || "present",
            remarks: remarks || "",
            markedBy: req.user._id,
            tenantId,
            studentId,
            date: new Date(date)
          }
        },
        upsert: true
      }
    }));

    const result = await Attendance.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });
  } catch (err) {
    console.error("Mark attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get attendance for a specific date
export const getAttendanceByDate = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { date, batch, course } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Build student filter
    const studentMatch = { tenantId };
    if (batch) studentMatch.batch = batch;
    if (course) studentMatch.course = course;

    // Get all students matching filters
    const students = await Student.find(studentMatch).select("_id name email rollNumber batch course").lean();

    // Get attendance records for this date
    const attendanceRecords = await Attendance.find({
      tenantId,
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    // Create a map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId.toString()] = record;
    });

    // Combine student data with attendance status
    const result = students.map(student => ({
      ...student,
      attendance: attendanceMap[student._id.toString()] || null
    }));

    // Calculate summary
    const summary = {
      total: students.length,
      present: attendanceRecords.filter(r => r.status === "present").length,
      absent: attendanceRecords.filter(r => r.status === "absent").length,
      late: attendanceRecords.filter(r => r.status === "late").length,
      excused: attendanceRecords.filter(r => r.status === "excused").length,
      notMarked: students.length - attendanceRecords.length
    };

    res.status(200).json({
      success: true,
      date: startDate,
      summary,
      students: result
    });
  } catch (err) {
    console.error("Get attendance by date error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get attendance history for a specific student
export const getStudentAttendance = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { studentId } = req.params;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    const match = { tenantId, studentId };
    
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const pageNum = Number(page) || 1;
    const lim = Math.min(Number(limit) || 30, 100);

    const total = await Attendance.countDocuments(match);
    const records = await Attendance.find(match)
      .sort({ date: -1 })
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .populate("markedBy", "name email")
      .lean();

    // Calculate summary
    const allRecords = await Attendance.find(match).lean();
    const summary = {
      total: allRecords.length,
      present: allRecords.filter(r => r.status === "present").length,
      absent: allRecords.filter(r => r.status === "absent").length,
      late: allRecords.filter(r => r.status === "late").length,
      excused: allRecords.filter(r => r.status === "excused").length
    };

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim) || 1,
      summary,
      records
    });
  } catch (err) {
    console.error("Get student attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get attendance report/summary by date range
export const getAttendanceReport = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { startDate, endDate, batch, course } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Build student filter
    const studentMatch = { tenantId };
    if (batch) studentMatch.batch = batch;
    if (course) studentMatch.course = course;

    // Get all students
    const students = await Student.find(studentMatch).select("_id name rollNumber batch course").lean();
    const studentIds = students.map(s => s._id);

    // Get attendance records for date range
    const attendanceRecords = await Attendance.find({
      tenantId,
      studentId: { $in: studentIds },
      date: { $gte: start, $lte: end }
    }).lean();

    // Group by student
    const studentAttendanceMap = {};
    students.forEach(student => {
      studentAttendanceMap[student._id.toString()] = {
        ...student,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
        percentage: 0
      };
    });

    attendanceRecords.forEach(record => {
      const studentId = record.studentId.toString();
      if (studentAttendanceMap[studentId]) {
        studentAttendanceMap[studentId][record.status]++;
        studentAttendanceMap[studentId].total++;
      }
    });

    // Calculate percentages
    const report = Object.values(studentAttendanceMap).map(student => {
      const totalDays = student.present + student.absent + student.late + student.excused;
      const percentage = totalDays > 0 
        ? ((student.present + student.late) / totalDays * 100).toFixed(2)
        : 0;
      
      return {
        ...student,
        percentage: parseFloat(percentage)
      };
    });

    // Sort by percentage descending
    report.sort((a, b) => b.percentage - a.percentage);

    res.status(200).json({
      success: true,
      startDate: start,
      endDate: end,
      totalStudents: students.length,
      report
    });
  } catch (err) {
    console.error("Get attendance report error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update attendance record
export const updateAttendance = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    const { status, remarks } = req.body;

    const attendance = await Attendance.findOneAndUpdate(
      { _id: id, tenantId },
      { 
        $set: { 
          status: status || "present",
          remarks: remarks || "",
          markedBy: req.user._id
        }
      },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated",
      attendance
    });
  } catch (err) {
    console.error("Update attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;

    const attendance = await Attendance.findOneAndDelete({ _id: id, tenantId });

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record deleted"
    });
  } catch (err) {
    console.error("Delete attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
