import express from "express";
import multer from "multer";
import { 
  markAttendance, 
  getAttendanceByDate, 
  getStudentAttendance,
  getAttendanceReport,
  updateAttendance,
  deleteAttendance,
  uploadAttendanceCSV
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// All routes require authentication
router.use(protect);

// Mark attendance (bulk operation)
router.post("/mark", markAttendance);

// Upload attendance from CSV file
router.post("/upload-csv", upload.single('file'), uploadAttendanceCSV);

// Get attendance by date with filters
router.get("/date", getAttendanceByDate);

// Get attendance history for a specific student
router.get("/student/:studentId", getStudentAttendance);

// Get attendance report for date range
router.get("/report", getAttendanceReport);

// Update specific attendance record
router.put("/:id", updateAttendance);

// Delete attendance record
router.delete("/:id", deleteAttendance);

export default router;
