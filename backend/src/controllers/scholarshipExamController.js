import ScholarshipExam from "../models/ScholarshipExam.js";
import ExamRegistration from "../models/ExamRegistration.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";

// Create new scholarship exam
export const createExam = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      console.error("[ERROR] Tenant ID missing in createExam");
      return res.status(403).json({ message: "Tenant ID missing" });
    }

    console.log("[CREATE EXAM] Incoming data:", JSON.stringify(req.body, null, 2));
    console.log("[CREATE EXAM] User info:", { id: req.user._id, tenantId });

    const examData = {
      ...req.body,
      tenantId,
      createdBy: req.user._id,
      // Don't set examCode here - let the pre-save hook handle it
    };
    
    // Remove examCode if it was sent in the request to ensure fresh generation
    delete examData.examCode;

    try {
      console.log("[CREATE EXAM] Attempting to create with data:", {
        ...examData,
        rewards: examData.rewards?.length || 0,
        examDates: examData.examDates?.length || 0
      });
      
      const exam = await ScholarshipExam.create(examData);
      console.log(`[SUCCESS] Exam created: ${exam.examCode} (ID: ${exam._id})`);
      
      res.status(201).json({
        success: true,
        message: "Scholarship exam created successfully",
        exam,
        landingPageUrl: `/exam/${exam.examCode}`,
      });
    } catch (dbErr) {
      console.error("[DB ERROR] ScholarshipExam.create failed:", dbErr);
      
      if (dbErr.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(dbErr.errors).forEach(key => {
          console.error(`[VALIDATION ERROR] ${key}:`, dbErr.errors[key].message);
          validationErrors[key] = dbErr.errors[key].message;
        });
        
        return res.status(400).json({
          message: "Validation failed",
          error: "Please check the form data",
          validationErrors,
        });
      }
      
      if (dbErr.code === 11000) {
        return res.status(409).json({
          message: "Duplicate entry",
          error: "An exam with this code already exists",
        });
      }
      
      res.status(500).json({
        message: "Database error",
        error: dbErr.message,
        details: process.env.NODE_ENV === 'development' ? dbErr.stack : undefined,
      });
    }
  } catch (err) {
    console.error("[FATAL ERROR] createExam:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      details: err.stack,
    });
  }
};

// Get all exams for tenant
export const getAllExams = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { status, page = 1, limit = 20 } = req.query;

    const filter = { tenantId };
    if (status) filter.status = status;

    const pageNum = Number(page);
    const lim = Math.min(Number(limit), 100);

    const total = await ScholarshipExam.countDocuments(filter);
    const exams = await ScholarshipExam.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim),
      exams,
    });
  } catch (err) {
    console.error("Get all exams error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get exam by ID (admin)
export const getExamById = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;

    const exam = await ScholarshipExam.findOne({ _id: id, tenantId })
      .populate("createdBy", "name email")
      .lean();

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({
      success: true,
      exam,
    });
  } catch (err) {
    console.error("Get exam by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get exam by code (public - for landing page)
export const getExamByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const exam = await ScholarshipExam.findOne({ 
      examCode: code.toUpperCase(),
      isPublic: true,
      status: { $in: ["active", "registrationClosed"] }
    }).lean();

    if (!exam) {
      return res.status(404).json({ message: "Exam not found or registration closed" });
    }

    // Check if registration is open
    const now = new Date();
    const canRegister = now >= new Date(exam.registrationStartDate) && 
                        now <= new Date(exam.registrationEndDate) &&
                        exam.status === "active";

    res.status(200).json({
      success: true,
      exam,
      canRegister,
    });
  } catch (err) {
    console.error("Get exam by code error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update exam
export const updateExam = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
    };

    delete updateData.tenantId;
    delete updateData.examCode;
    delete updateData.stats;

    const exam = await ScholarshipExam.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      exam,
    });
  } catch (err) {
    console.error("Update exam error:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Delete exam
export const deleteExam = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;

    // Check if exam has registrations
    const registrationCount = await ExamRegistration.countDocuments({ examId: id });
    if (registrationCount > 0) {
      return res.status(400).json({ 
        message: "Cannot delete exam with existing registrations. Archive it instead." 
      });
    }

    const exam = await ScholarshipExam.findOneAndDelete({ _id: id, tenantId });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (err) {
    console.error("Delete exam error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Publish results
export const publishResults = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;

    const exam = await ScholarshipExam.findOneAndUpdate(
      { _id: id, tenantId },
      {
        $set: {
          resultsPublished: true,
          resultsPublishedDate: new Date(),
          status: "resultPublished",
          updatedBy: req.user._id,
        },
      },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({
      success: true,
      message: "Results published successfully",
      exam,
    });
  } catch (err) {
    console.error("Publish results error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get exam statistics
export const getExamStats = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;

    const exam = await ScholarshipExam.findOne({ _id: id, tenantId });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const totalRegistrations = await ExamRegistration.countDocuments({ examId: id });
    const appeared = await ExamRegistration.countDocuments({ examId: id, hasAttended: true });
    const passed = await ExamRegistration.countDocuments({ examId: id, result: "pass" });
    const enrolled = await ExamRegistration.countDocuments({ examId: id, enrollmentStatus: "enrolled" });

    // Update exam stats
    await ScholarshipExam.findByIdAndUpdate(id, {
      $set: {
        "stats.totalRegistrations": totalRegistrations,
        "stats.totalAppearedStudents": appeared,
        "stats.passedStudents": passed,
        "stats.totalEnrollments": enrolled,
      },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalRegistrations,
        appeared,
        passed,
        enrolled,
        absent: totalRegistrations - appeared,
        passPercentage: appeared > 0 ? ((passed / appeared) * 100).toFixed(2) : 0,
        conversionRate: totalRegistrations > 0 ? ((enrolled / totalRegistrations) * 100).toFixed(2) : 0,
      },
    });
  } catch (err) {
    console.error("Get exam stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all registrations for an exam
export const getExamRegistrations = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    const { status, enrollmentStatus, result, search, page = 1, limit = 50 } = req.query;

    const filter = { examId: id, tenantId };
    if (status) filter.status = status;
    if (enrollmentStatus) filter.enrollmentStatus = enrollmentStatus;
    if (result) filter.result = result;
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Number(page);
    const lim = Math.min(Number(limit), 100);

    const total = await ExamRegistration.countDocuments(filter);
    const registrations = await ExamRegistration.find(filter)
      .populate("examId", "examName examCode")
      .sort({ rank: 1, marksObtained: -1, registeredAt: 1 })
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim),
      registrations,
    });
  } catch (err) {
    console.error("Get exam registrations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Register student for exam (public endpoint)
export const registerForExam = async (req, res) => {
  try {
    const { code } = req.params;
    const registrationData = req.body;

    // Find exam
    const exam = await ScholarshipExam.findOne({ 
      examCode: code.toUpperCase(),
      status: "active",
      isPublic: true,
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found or registration closed" });
    }

    // Check registration dates
    const now = new Date();
    if (now < new Date(exam.registrationStartDate)) {
      return res.status(400).json({ message: "Registration has not started yet" });
    }
    if (now > new Date(exam.registrationEndDate)) {
      return res.status(400).json({ message: "Registration has been closed" });
    }

    // Check if already registered
    const existing = await ExamRegistration.findOne({
      examId: exam._id,
      $or: [
        { email: registrationData.email },
        { phone: registrationData.phone },
      ],
    });

    if (existing) {
      return res.status(400).json({ 
        message: "You have already registered for this exam",
        registrationNumber: existing.registrationNumber,
      });
    }

    // Create user account for student portal
    const tempPassword = `${registrationData.studentName.split(" ")[0].toLowerCase()}@${new Date().getFullYear()}`;
    
    let newUser;
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        email: registrationData.email,
        tenantId: exam.tenantId 
      });
      
      if (existingUser) {
        newUser = existingUser;
      } else {
        newUser = await User.create({
          name: registrationData.studentName,
          email: registrationData.email,
          password: tempPassword,
          tenantId: exam.tenantId,
          role: "student",
          status: "active",
        });
      }
    } catch (userError) {
      console.error("User creation error:", userError);
      // Continue without user - registration can still work
      newUser = null;
    }

    // Generate registration number manually as backup
    const registrationCount = await ExamRegistration.countDocuments({ examId: exam._id });
    const registrationNumber = `${exam.examCode}-${String(registrationCount + 1).padStart(5, "0")}`;
    
    // Generate username manually as backup  
    const baseUsername = registrationData.email.split("@")[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;
    
    while (await ExamRegistration.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create registration
    const registration = await ExamRegistration.create({
      ...registrationData,
      tenantId: exam.tenantId,
      examId: exam._id,
      userId: newUser?._id,
      registrationNumber, // Set manually
      username, // Set manually
      paymentAmount: exam.registrationFee.amount,
      paymentStatus: exam.registrationFee.paymentRequired ? "pending" : "waived",
      // Convert address string to object format expected by schema
      address: typeof registrationData.address === 'string' ? {
        street: registrationData.address,
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      } : registrationData.address,
      // Set selected exam date
      preferredExamDate: registrationData.selectedExamDate ? new Date(registrationData.selectedExamDate) : null,
    });

    console.log(`Registration created successfully: ${registration.registrationNumber}`);

    // Update exam stats and registration count
    await ScholarshipExam.findByIdAndUpdate(exam._id, {
      $inc: { 
        "stats.totalRegistrations": 1,
        "registrationCount": 1
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Check your email for login credentials.",
      registration: {
        registrationNumber: registration.registrationNumber,
        username: registration.username,
        temporaryPassword: newUser ? tempPassword : null,
        loginUrl: `/exam-portal/login`,
      }
    });
  } catch (err) {
    console.error("Register for exam error:", err);
    
    // Handle specific validation errors
    if (err.name === 'ValidationError') {
      console.error("Validation errors:", err.errors);
      return res.status(400).json({
        message: "Validation failed",
        error: Object.keys(err.errors).map(key => err.errors[key].message).join(', ')
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate registration",
        error: "This email or phone number is already registered for this exam"
      });
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Update registration (admin)
export const updateRegistration = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    const updateData = req.body;

    delete updateData.tenantId;
    delete updateData.examId;
    delete updateData.registrationNumber;

    const registration = await ExamRegistration.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.status(200).json({
      success: true,
      message: "Registration updated successfully",
      registration,
    });
  } catch (err) {
    console.error("Update registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update attendance for a specific registration
export const updateAttendance = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    const { hasAttended, examDateAttended } = req.body;

    const updateData = {
      hasAttended: Boolean(hasAttended),
      attendanceMarked: true,
    };

    // Only set examDateAttended if student is marked as attended
    if (hasAttended && examDateAttended) {
      updateData.examDateAttended = new Date(examDateAttended);
    } else if (!hasAttended) {
      updateData.examDateAttended = null;
    }

    const registration = await ExamRegistration.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Update exam stats
    const examId = registration.examId;
    const totalAppeared = await ExamRegistration.countDocuments({ 
      examId, 
      tenantId, 
      hasAttended: true 
    });

    await ScholarshipExam.findByIdAndUpdate(examId, {
      $set: { "stats.totalAppearedStudents": totalAppeared }
    });

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      registration,
    });
  } catch (err) {
    console.error("Update attendance error:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

// Convert registration to student admission
export const convertToAdmission = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    const { batchId, course, feeAmount } = req.body;

    const registration = await ExamRegistration.findOne({ _id: id, tenantId });
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (registration.convertedToStudent) {
      return res.status(400).json({ message: "Already converted to student" });
    }

    // Create student record
    const student = await Student.create({
      name: registration.studentName,
      email: registration.email,
      phone: registration.phone,
      dateOfBirth: registration.dateOfBirth,
      gender: registration.gender,
      fatherName: registration.fatherName,
      motherName: registration.motherName,
      address: registration.address,
      batch: batchId,
      course,
      tenantId,
      status: "active",
      admissionDate: new Date(),
      feeDetails: {
        totalFee: feeAmount,
        paidAmount: 0,
        pendingAmount: feeAmount,
      },
    });

    // Update registration
    await ExamRegistration.findByIdAndUpdate(id, {
      $set: {
        convertedToStudent: true,
        studentId: student._id,
        enrollmentStatus: "converted",
        enrollmentDate: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully converted to student admission",
      student,
    });
  } catch (err) {
    console.error("Convert to admission error:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Upload results from CSV
export const uploadResultsCSV = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file uploaded" });
    }

    const exam = await ScholarshipExam.findOne({ _id: id, tenantId });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Parse CSV file
    const csvData = req.file.buffer.toString('utf-8');
    const lines = csvData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      return res.status(400).json({ message: "CSV file must have at least a header row and one data row" });
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataRows = lines.slice(1);

    // Validate headers
    const requiredHeaders = ['Registration Number', 'Marks Obtained', 'Has Attended', 'Result'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({ 
        message: `Missing required columns: ${missingHeaders.join(', ')}` 
      });
    }

    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
      const rowData = {};
      
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });

      try {
        const registrationNumber = rowData['Registration Number'];
        if (!registrationNumber) {
          errors.push(`Row ${i + 2}: Missing registration number`);
          errorCount++;
          continue;
        }

        // Find registration
        const registration = await ExamRegistration.findOne({
          examId: id,
          registrationNumber: registrationNumber,
          tenantId
        });

        if (!registration) {
          errors.push(`Row ${i + 2}: Registration ${registrationNumber} not found`);
          errorCount++;
          continue;
        }

        // Parse data
        const marksObtained = parseInt(rowData['Marks Obtained']) || 0;
        const hasAttended = rowData['Has Attended'].toLowerCase() === 'true';
        const result = rowData['Result'].toLowerCase();
        const rank = parseInt(rowData['Rank']) || null;

        // Validate marks
        if (marksObtained < 0 || marksObtained > exam.totalMarks) {
          errors.push(`Row ${i + 2}: Invalid marks ${marksObtained} (must be 0-${exam.totalMarks})`);
          errorCount++;
          continue;
        }

        // Validate result
        if (!['pass', 'fail', 'absent', 'pending'].includes(result)) {
          errors.push(`Row ${i + 2}: Invalid result "${result}" (must be pass, fail, absent, or pending)`);
          errorCount++;
          continue;
        }

        // Calculate percentage
        const percentage = exam.totalMarks > 0 ? (marksObtained / exam.totalMarks) * 100 : 0;

        // Update registration
        await ExamRegistration.findByIdAndUpdate(registration._id, {
          $set: {
            marksObtained,
            percentage,
            hasAttended,
            result,
            rank,
            status: 'appeared',
            updatedAt: new Date()
          }
        });

        updatedCount++;
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        errors.push(`Row ${i + 2}: ${error.message}`);
        errorCount++;
      }
    }

    // Update exam stats
    const totalRegistrations = await ExamRegistration.countDocuments({ examId: id });
    const appeared = await ExamRegistration.countDocuments({ examId: id, hasAttended: true });
    const passed = await ExamRegistration.countDocuments({ examId: id, result: "pass" });

    await ScholarshipExam.findByIdAndUpdate(id, {
      $set: {
        "stats.totalRegistrations": totalRegistrations,
        "stats.totalAppearedStudents": appeared,
        "stats.passedStudents": passed,
      },
    });

    res.status(200).json({
      success: true,
      message: "Results uploaded successfully",
      updatedCount,
      errorCount,
      totalRows: dataRows.length,
      errors: errors.slice(0, 10) // Limit to first 10 errors
    });

  } catch (err) {
    console.error("Upload results CSV error:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Public API to get result by registration number
export const getPublicResult = async (req, res) => {
  try {
    const { registrationNumber } = req.params;

    const registration = await ExamRegistration.findOne({
      registrationNumber: registrationNumber
    }).populate('examId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    // Return the result data
    res.json({
      success: true,
      registration: {
        _id: registration._id,
        registrationNumber: registration.registrationNumber,
        studentName: registration.studentName,
        email: registration.email,
        phone: registration.phone,
        currentClass: registration.currentClass,
        school: registration.school,
        hasAttended: registration.hasAttended,
        marksObtained: registration.marksObtained,
        percentage: registration.percentage,
        rank: registration.rank,
        result: registration.result,
        rewardEligible: registration.rewardEligible,
        rewardDetails: registration.rewardDetails,
        enrollmentStatus: registration.enrollmentStatus,
        createdAt: registration.createdAt
      },
      exam: {
        _id: registration.examId._id,
        examName: registration.examId.examName,
        examCode: registration.examId.examCode,
        totalMarks: registration.examId.totalMarks,
        passingMarks: registration.examId.passingMarks,
        examDate: registration.examId.examDate,
        resultsPublished: registration.examId.resultsPublished
      }
    });
  } catch (error) {
    console.error("Error fetching public result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch result"
    });
  }
};

// Download admit card (generates HTML that can be printed or saved as PDF)
export const downloadAdmitCard = async (req, res) => {
  try {
    const { registrationNumber } = req.params;

    const registration = await ExamRegistration.findOne({
      registrationNumber: registrationNumber
    }).populate('examId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    // Generate HTML admit card
    const admitCardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admit Card - ${registration.registrationNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .admit-card {
            background: white;
            border: 2px solid #000;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 18px;
            color: #374151;
        }
        .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .detail-item {
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .label {
            font-weight: bold;
            color: #374151;
            font-size: 14px;
        }
        .value {
            font-size: 16px;
            color: #000;
            margin-top: 5px;
        }
        .instructions {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .instructions h3 {
            color: #92400e;
            margin-top: 0;
        }
        .instructions ul {
            color: #92400e;
        }
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #000;
        }
        .signature {
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #000;
            width: 200px;
            margin-bottom: 5px;
        }
        @media print {
            body { background: white; }
            .admit-card { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="admit-card">
        <div class="header">
            <div class="title">ADMIT CARD</div>
            <div class="subtitle">${registration.examId.examName}</div>
        </div>
        
        <div class="details">
            <div class="detail-item">
                <div class="label">Registration Number</div>
                <div class="value">${registration.registrationNumber}</div>
            </div>
            <div class="detail-item">
                <div class="label">Exam Code</div>
                <div class="value">${registration.examId.examCode}</div>
            </div>
            <div class="detail-item">
                <div class="label">Student Name</div>
                <div class="value">${registration.studentName}</div>
            </div>
            <div class="detail-item">
                <div class="label">Father's Name</div>
                <div class="value">${registration.fatherName}</div>
            </div>
            <div class="detail-item">
                <div class="label">Date of Birth</div>
                <div class="value">${new Date(registration.dateOfBirth).toLocaleDateString('en-IN')}</div>
            </div>
            <div class="detail-item">
                <div class="label">Gender</div>
                <div class="value">${registration.gender}</div>
            </div>
            <div class="detail-item">
                <div class="label">Email</div>
                <div class="value">${registration.email}</div>
            </div>
            <div class="detail-item">
                <div class="label">Phone</div>
                <div class="value">${registration.phone}</div>
            </div>
            <div class="detail-item">
                <div class="label">Current Class</div>
                <div class="value">${registration.currentClass}</div>
            </div>
            <div class="detail-item">
                <div class="label">School</div>
                <div class="value">${registration.school}</div>
            </div>
            <div class="detail-item">
                <div class="label">Exam Date</div>
                <div class="value">${new Date(registration.examId.examDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
            <div class="detail-item">
                <div class="label">Exam Time</div>
                <div class="value">${new Date(registration.examId.examDate).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
            </div>
        </div>
        
        <div class="instructions">
            <h3>📋 EXAMINATION INSTRUCTIONS</h3>
            <ul>
                <li><strong>Arrival Time:</strong> Please arrive at the examination center 30 minutes before the scheduled exam time</li>
                <li><strong>Required Documents:</strong> Bring this admit card along with a valid photo ID proof (Aadhaar Card/School ID)</li>
                <li><strong>Writing Materials:</strong> Use only blue or black ballpoint pen. Pencils and erasers are not allowed</li>
                <li><strong>Electronic Devices:</strong> Mobile phones, calculators, and other electronic devices are strictly prohibited</li>
                <li><strong>Dress Code:</strong> Come in comfortable, formal attire. Avoid wearing shoes with metal parts</li>
                <li><strong>Food & Water:</strong> You're allowed to bring a water bottle (transparent) and light snacks if needed</li>
            </ul>
        </div>
        
        <div class="signature-section">
            <div class="signature">
                <div class="signature-line"></div>
                <div>Student Signature</div>
            </div>
            <div class="signature">
                <div class="signature-line"></div>
                <div>Invigilator Signature</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280;">
            Generated on ${new Date().toLocaleDateString('en-IN')} | Best of Luck! 🍀
        </div>
    </div>
    
    <script>
        // Auto-print functionality
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 1000);
        }
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="admit_card_${registrationNumber}.html"`);
    res.send(admitCardHTML);

  } catch (error) {
    console.error("Error generating admit card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate admit card"
    });
  }
};

// Submit enrollment interest
export const submitEnrollmentInterest = async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    const registration = await ExamRegistration.findOne({
      registrationNumber: registrationNumber
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    // Update enrollment status
    registration.enrollmentStatus = "interested";
    await registration.save();

    res.json({
      success: true,
      message: "Enrollment interest submitted successfully",
      data: {
        registrationNumber: registration.registrationNumber,
        enrollmentStatus: registration.enrollmentStatus
      }
    });

  } catch (error) {
    console.error("Error submitting enrollment interest:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit enrollment interest"
    });
  }
};

// Update enrollment status for a registration
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { enrollmentStatus } = req.body;

    // Validate enrollment status
    const validStatuses = [
      "notInterested", 
      "interested", 
      "followUp", 
      "enrolled", 
      "converted", 
      "directAdmission",
      "waitingList",
      "cancelled"
    ];

    if (!validStatuses.includes(enrollmentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment status"
      });
    }

    // Find the registration
    const registration = await ExamRegistration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found"
      });
    }

    // Check if user has permission (basic tenant check)
    const exam = await ScholarshipExam.findById(registration.examId);
    if (!exam || exam.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Update enrollment status
    registration.enrollmentStatus = enrollmentStatus;
    
    // Add enrollment date if status is enrolled, converted, or directAdmission
    if (["enrolled", "converted", "directAdmission"].includes(enrollmentStatus)) {
      registration.enrollmentDate = new Date();
    }

    await registration.save();

    res.json({
      success: true,
      message: "Enrollment status updated successfully",
      data: {
        registrationId: registration._id,
        enrollmentStatus: registration.enrollmentStatus,
        enrollmentDate: registration.enrollmentDate
      }
    });

  } catch (error) {
    console.error("Error updating enrollment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update enrollment status"
    });
  }
};

export { updateEnrollmentStatus };
