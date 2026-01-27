import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  getMyTests,
  getMyMarks,
  getMyReports,
  getMyAttendance
} from "../controllers/studentDashboardController.js";

const router = express.Router();

/**
 * All routes require "student" role
 * Students can ONLY access their own data
 */

// Get student's assigned tests
router.get("/tests", protect, authorizeRoles("student"), getMyTests);

// Get student's marks for a specific test
router.get("/tests/:testId/marks", protect, authorizeRoles("student"), getMyMarks);

// Get student's performance reports
router.get("/reports", protect, authorizeRoles("student"), getMyReports);

// Get student's test attendance
router.get("/attendance", protect, authorizeRoles("student"), getMyAttendance);

export default router;
