import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getBatchStudents,
  addStudentToBatch,
  removeStudentFromBatch,
  getStudentBatches,
  addStudentToMultipleBatches,
} from "../controllers/batchStudentController.js";

const router = express.Router();

/**
 * Batch Students Routes
 * Manages many-to-many relationship between Students and Batches
 */

// GET all students in a batch
// GET /api/batches/:batchId/students
router.get("/:batchId/students", protect, getBatchStudents);

// POST add single student to batch
// POST /api/batches/:batchId/students
router.post("/:batchId/students", protect, addStudentToBatch);

// DELETE remove student from batch
// DELETE /api/batches/:batchId/students/:studentId
router.delete("/:batchId/students/:studentId", protect, removeStudentFromBatch);

// GET all batches for a student
// GET /api/students/:studentId/batches
router.get("/student/:studentId/batches", protect, getStudentBatches);

// POST add student to multiple batches
// POST /api/students/:studentId/batches
router.post("/student/:studentId/batches", protect, addStudentToMultipleBatches);

export default router;
