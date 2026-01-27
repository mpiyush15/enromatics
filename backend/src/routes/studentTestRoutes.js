import express from "express";
import { protectStudent } from "../middleware/protectStudent.js";
import {
  getStudentTests,
  getStudentTestMarks
} from "../controllers/studentTestController.js";

const router = express.Router();

/**
 * Student-only routes
 * Students can ONLY see their own test data
 */

// Get student's tests
router.get("/tests", protectStudent, getStudentTests);

// Get marks for a specific test
router.get("/tests/:testId/marks", protectStudent, getStudentTestMarks);

export default router;
