import express from "express";
import { 
  markAttendance, 
  getAttendanceByDate, 
  getStudentAttendance,
  getAttendanceReport,
  updateAttendance,
  deleteAttendance
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Mark attendance (bulk operation)
router.post("/mark", markAttendance);

// Get attendance by date with filters
router.get("/date", getAttendanceByDate);

// Get attendance history for a specific student
router.get("/student/:studentId", getStudentAttendance);

// Get attendance report for date range
router.get("/report", getAttendanceReport);

// Update specific attendance record
router.put("/:id", updateAttendance);

// Delete attendance record
router.delete("/:id", deleteAttendance);

export default router;
