import express from "express";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updatePermissions,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes require authentication and tenantAdmin role
router.use(protect);
router.use(authorizeRoles("tenantAdmin"));

// Get all employees for the tenant
router.get("/", getEmployees);

// Get single employee
router.get("/:id", getEmployeeById);

// Create new employee
router.post("/", createEmployee);

// Update employee
router.put("/:id", updateEmployee);

// Delete employee
router.delete("/:id", deleteEmployee);

// Update employee permissions only
router.patch("/:id/permissions", updatePermissions);

export default router;
