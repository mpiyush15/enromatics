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

    // Update exam stats
    await ScholarshipExam.findByIdAndUpdate(exam._id, {
      $inc: { "stats.totalRegistrations": 1 },
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
