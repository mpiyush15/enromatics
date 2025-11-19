import express from "express";
import {
  createExam,
  getAllExams,
  getExamById,
  getExamByCode,
  updateExam,
  deleteExam,
  publishResults,
  getExamStats,
  getExamRegistrations,
  registerForExam,
  updateRegistration,
  convertToAdmission,
  getPublicResult,
  downloadAdmitCard,
  submitEnrollmentInterest,
} from "../controllers/scholarshipExamController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no auth required)
router.get("/public/:code", getExamByCode);
router.post("/public/:code/register", registerForExam);
router.get("/public/result/:registrationNumber", getPublicResult);
router.get("/public/admit-card/:registrationNumber", downloadAdmitCard);
router.post("/public/enrollment-interest", submitEnrollmentInterest);

// Protected routes (require authentication)
router.use(protect);

// Exam CRUD
router.post("/", createExam);
router.get("/", getAllExams);
router.get("/:id", getExamById);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

// Exam operations
router.post("/:id/publish-results", publishResults);
router.get("/:id/stats", getExamStats);
router.get("/:id/registrations", getExamRegistrations);

// Registration management
router.put("/registration/:id", updateRegistration);
router.post("/registration/:id/convert", convertToAdmission);

export default router;
