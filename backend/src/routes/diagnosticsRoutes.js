import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.js";
import {
  diagnoseStudentData,
  fixBatchSync,
  getStudentTestsWithMarks,
} from "../controllers/diagnosticsController.js";

const router = express.Router();

/**
 * Diagnostic endpoints - Admin only
 * Check data sync issues between students, tests, and marks
 */

// GET /api/diagnostics/:tenantId - Diagnose all students in tenant
router.get("/:tenantId", protect, authorizeRoles("superAdmin", "tenantAdmin"), diagnoseStudentData);

// GET /api/diagnostics/:tenantId/:studentId - Diagnose specific student
router.get("/:tenantId/:studentId", protect, authorizeRoles("superAdmin", "tenantAdmin"), diagnoseStudentData);

// POST /api/diagnostics/:tenantId/fix-batch - Fix batch sync for all students
router.post("/:tenantId/fix-batch", protect, authorizeRoles("superAdmin", "tenantAdmin"), fixBatchSync);

// GET /api/diagnostics/:tenantId/:studentId/tests-with-marks - Get student tests with marks
router.get("/:tenantId/:studentId/tests-with-marks", protect, getStudentTestsWithMarks);

export default router;
