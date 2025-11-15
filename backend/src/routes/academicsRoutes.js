import express from "express";
import {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
  markAttendance,
  getTestAttendance,
  enterMarks,
  getTestMarks,
  getStudentTests,
  getReports,
  getTestsForStudent,
} from "../controllers/academicsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { protectStudent } from "../middleware/protectStudent.js";

const router = express.Router();

// Test management routes
router.post(
  "/tests",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  createTest
);

router.get("/tests", protect, getTests);

router.get("/tests/:id", protect, getTestById);

router.put(
  "/tests/:id",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  updateTest
);

router.delete(
  "/tests/:id",
  protect,
  authorizeRoles("tenantAdmin"),
  deleteTest
);

// Attendance routes
router.post(
  "/tests/:id/attendance",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  markAttendance
);

router.get("/tests/:id/attendance", protect, getTestAttendance);

// Marks routes
router.post(
  "/tests/:id/marks",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  enterMarks
);

router.get("/tests/:id/marks", protect, getTestMarks);

// Student-specific routes
router.get("/students/:studentId/tests", protect, getStudentTests);
router.get("/student/tests", protectStudent, getTestsForStudent);

// Reports route
router.get("/reports", protect, getReports);

export default router;
