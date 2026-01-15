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
import {
  getAllLessons,
  getLessonsForCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  assignLessonToCourses,
} from "../controllers/globalLessonController.js";
import {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { protectStudent } from "../middleware/protectStudent.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Test management routes
router.post(
  "/tests",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  requirePermission("canAccessTests"),
  createTest
);

router.get("/tests", protect, getTests);

// ⚠️ IMPORTANT: Specific routes MUST come before generic :id routes
// Attendance routes (before /tests/:id)
router.post(
  "/tests/:id/attendance",
  protect,
  markAttendance
);

router.get("/tests/:id/attendance", protect, getTestAttendance);

// Marks routes (before /tests/:id)
router.post(
  "/tests/:id/marks",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  requirePermission("canAccessTests"),
  enterMarks
);

router.get("/tests/:id/marks", protect, getTestMarks);

// Generic test routes (AFTER specific routes)
router.get("/tests/:id", protect, getTestById);

router.put(
  "/tests/:id",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  requirePermission("canAccessTests"),
  updateTest
);

router.delete(
  "/tests/:id",
  protect,
  authorizeRoles("tenantAdmin"),
  deleteTest
);

// Student-specific routes
router.get("/students/:studentId/tests", protect, getStudentTests);
router.get("/student/tests", protectStudent, getTestsForStudent);

// Reports route
router.get("/reports", protect, getReports);

// ============== GLOBAL LESSONS ROUTES ==============

// Get all lessons for tenant (with optional course filter)
router.get("/lessons", protect, getAllLessons);

// Get lessons for a specific course
router.get("/lessons/course/:courseId", protect, getLessonsForCourse);

// Create new lesson (global - can be assigned to multiple courses)
router.post(
  "/lessons",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  createLesson
);

// Update lesson
router.put(
  "/lessons/:lessonId",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  updateLesson
);

// Delete lesson or remove from course
router.delete(
  "/lessons",
  protect,
  authorizeRoles("tenantAdmin"),
  deleteLesson
);

// Alternative route for path-based lesson deletion
router.delete(
  "/lessons/:lessonId",
  protect,
  authorizeRoles("tenantAdmin"),
  (req, res, next) => {
    // Convert path param to body for handler compatibility
    if (!req.body) req.body = {};
    req.body.lessonId = req.params.lessonId;
    next();
  },
  deleteLesson
);

// Assign lesson to additional courses
router.post(
  "/lessons/:lessonId/assign-courses",
  protect,
  authorizeRoles("tenantAdmin", "teacher"),
  assignLessonToCourses
);

// ============== GLOBAL SUBJECTS ROUTES ==============

// Get all subjects for tenant
router.get("/subjects", protect, getAllSubjects);

// Create new subject
router.post(
  "/subjects",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  createSubject
);

// Update subject
router.put(
  "/subjects/:subjectId",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  updateSubject
);

// Delete subject
router.delete(
  "/subjects/:subjectId",
  protect,
  authorizeRoles("tenantAdmin"),
  deleteSubject
);

export default router;
