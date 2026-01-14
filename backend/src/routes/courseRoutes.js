import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import {
  getLessonsForCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all courses for the tenant
router.get("/", getCourses);

// Get single course
router.get("/:id", getCourseById);

// Create new course (tenantAdmin only)
router.post("/", authorizeRoles("tenantAdmin"), createCourse);

// Update course (tenantAdmin only)
router.put("/:id", authorizeRoles("tenantAdmin"), updateCourse);

// Delete course (tenantAdmin only)
router.delete("/:id", authorizeRoles("tenantAdmin"), deleteCourse);

// ============ LESSON ROUTES ============
// Get all lessons for a course
router.get("/:courseId/lessons", getLessonsForCourse);

// Get single lesson
router.get("/:courseId/lessons/:lessonId", getLessonById);

// Create new lesson (tenantAdmin only)
router.post("/:courseId/lessons", authorizeRoles("tenantAdmin"), createLesson);

// Update lesson (tenantAdmin only)
router.put("/:courseId/lessons/:lessonId", authorizeRoles("tenantAdmin"), updateLesson);

// Delete lesson (tenantAdmin only)
router.delete("/:courseId/lessons/:lessonId", authorizeRoles("tenantAdmin"), deleteLesson);

export default router;
