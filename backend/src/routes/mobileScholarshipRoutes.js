import express from 'express';
import { 
  getMobileScholarshipExams,
  registerForScholarshipExam,
  getMobileUserRegistrations,
  getRegistrationByNumber
} from '../controllers/mobileScholarshipController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get available scholarship exams for mobile
router.get('/exams', getMobileScholarshipExams);

// Register for a scholarship exam
router.post('/exams/:examId/register', registerForScholarshipExam);

// Get user's registrations
router.get('/registrations', getMobileUserRegistrations);

// Get registration by number
router.get('/registrations/:registrationNumber', getRegistrationByNumber);

export default router;