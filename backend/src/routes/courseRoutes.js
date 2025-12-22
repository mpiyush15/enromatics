import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
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

export default router;
