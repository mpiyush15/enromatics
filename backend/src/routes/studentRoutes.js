import express from "express";
import { addStudent, getStudents, getStudentById, updateStudent, bulkUploadStudents } from "../controllers/studentController.js";
import { resetStudentPassword } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import Student from "../models/Student.js";

const router = express.Router();

/**
 * @route POST /api/students/bulk-upload
 * @desc Bulk upload students from CSV
 * @access Private - tenantAdmin only
 */
router.post(
  "/bulk-upload",
  protect,
  authorizeRoles("tenantAdmin", "teacher", "staff"),
  requirePermission("canAccessStudents"),
  bulkUploadStudents
);

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
  authorizeRoles("tenantAdmin"),
  resetStudentPassword
);

// Delete student
router.delete(
  "/:id",
  protect,
  authorizeRoles("tenantAdmin"),
  requirePermission("canAccessStudents"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.user.tenantId;
      
      // Find and delete student (only for current tenant)
      const deletedStudent = await Student.findOneAndDelete({ 
        _id: id, 
        tenantId: tenantId 
      });
      
      if (!deletedStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      res.json({ 
        message: 'Student deleted successfully',
        student: deletedStudent 
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
