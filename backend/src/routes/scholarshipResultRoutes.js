import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import csv from "csv-parser";
import { tenantProtect } from "../middleware/tenantProtect.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/results";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  },
});

// Get all results for a tenant
router.get("/", tenantProtect, async (req, res) => {
  try {
    const { tenantId, examId } = req.query;
    
    // Mock data for now - replace with actual database queries
    const results = [
      {
        _id: "result1",
        examId: "exam1",
        examName: "Scholarship Test 2024",
        examCode: "ST2024",
        registrationNumber: "REG001",
        studentName: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        currentClass: "10",
        school: "ABC School",
        marksObtained: 85,
        maxMarks: 100,
        percentage: 85,
        rank: 1,
        result: "pass",
        rewardEligible: true,
        rewardDetails: {
          type: "Merit Scholarship",
          amount: 5000,
          description: "Excellence in academics"
        },
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "result2",
        examId: "exam1",
        examName: "Scholarship Test 2024",
        examCode: "ST2024",
        registrationNumber: "REG002",
        studentName: "Jane Smith",
        email: "jane@example.com",
        phone: "0987654321",
        currentClass: "10",
        school: "XYZ School",
        marksObtained: 78,
        maxMarks: 100,
        percentage: 78,
        rank: 2,
        result: "pass",
        rewardEligible: false,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // Filter by examId if provided
    const filteredResults = examId && examId !== 'all' 
      ? results.filter(r => r.examId === examId)
      : results;

    res.json({
      success: true,
      results: filteredResults,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
});

// Upload results file
router.post("/upload", tenantProtect, upload.single("file"), async (req, res) => {
  try {
    const { examId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required",
      });
    }

    // Process CSV file
    const results = [];
    const filePath = file.path;

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Process each row
          const result = {
            examId,
            registrationNumber: row['Registration Number'],
            studentName: row['Student Name'],
            marksObtained: parseInt(row['Marks Obtained']) || 0,
            attendance: row['Attendance (Present/Absent)'] === 'Present',
            rewardType: row['Reward Type (Optional)'] || null,
            rewardAmount: row['Reward Amount (Optional)'] ? parseFloat(row['Reward Amount (Optional)']) : null,
            rewardDescription: row['Reward Description (Optional)'] || null,
          };
          results.push(result);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Here you would save the results to your database
    // For now, we'll just return success
    console.log(`Processed ${results.length} results for exam ${examId}`);

    res.json({
      success: true,
      message: `Successfully uploaded ${results.length} results`,
      processedCount: results.length,
    });
  } catch (error) {
    console.error("Error uploading results:", error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload results",
      error: error.message,
    });
  }
});

// Update attendance for a registration
router.patch("/registration/:registrationId/attendance", tenantProtect, async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { hasAttended } = req.body;

    // Here you would update the registration in your database
    console.log(`Updated attendance for ${registrationId}: ${hasAttended}`);

    res.json({
      success: true,
      message: "Attendance updated successfully",
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
      error: error.message,
    });
  }
});

export default router;