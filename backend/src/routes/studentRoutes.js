import express from "express";
import { addStudent, getStudents, getStudentById, updateStudent } from "../controllers/studentController.js";
import { resetStudentPassword } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

/**
 * @route POST /api/students
 * @desc Add a new student (tenant only)
 * @access Private - Requires canAccessStudents permission
 */
router.post(
  "/",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  requirePermission("canAccessStudents"),
  addStudent
);

/**
 * @route GET /api/students
 * @desc Fetch all students for current tenant
 * @access Private - Requires canAccessStudents permission
 */
router.get(
  "/",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  requirePermission("canAccessStudents"),
  getStudents
);

// Get single student by id
router.get(
  "/:id",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  requirePermission("canAccessStudents"),
  getStudentById
);

// Update student
router.put(
  "/:id",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  requirePermission("canAccessStudents"),
  updateStudent
);

// Admin reset student password (generate or set new password)
router.put(
  "/:id/reset-password",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  requirePermission("canAccessStudents"),
  resetStudentPassword
);

export default router;
