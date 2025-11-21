import ScholarshipExam from '../models/ScholarshipExam.js';
import ExamRegistration from '../models/ExamRegistration.js';
import User from '../models/User.js';
import Student from '../models/Student.js';

// Get scholarship exams for mobile app (EXACT same as web dashboard)
const getMobileScholarshipExams = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    
    if (!tenantId) {
      return res.status(403).json({ 
        message: "Tenant ID missing" 
      });
    }

    // Use EXACT same query as web dashboard getAllExams controller
    const filter = { tenantId };
    
    const total = await ScholarshipExam.countDocuments(filter);
    const exams = await ScholarshipExam.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Get registration counts for each exam
    const examsWithCounts = await Promise.all(
      exams.map(async (exam) => {
        // Get exam statistics (same structure as web dashboard)
        const totalRegistrations = await ExamRegistration.countDocuments({
          examId: exam._id
        });
        
        const totalAppeared = await ExamRegistration.countDocuments({
          examId: exam._id,
          attendanceStatus: 'present'
        });
        
        const totalPassed = await ExamRegistration.countDocuments({
          examId: exam._id,
          status: 'passed'
        });
        
        const totalEnrolled = await ExamRegistration.countDocuments({
          examId: exam._id,
          enrollmentStatus: 'enrolled'
        });

        const userRegistration = await ExamRegistration.findOne({
          examId: exam._id,
          $or: [
            { email: req.user.email },
            { userId: req.user.userId }
          ]
        });

        // Return exact same structure as web dashboard
        return {
          ...exam,
          stats: {
            totalRegistrations,
            totalAppeared, 
            totalPassed,
            totalEnrolled,
            passPercentage: totalAppeared > 0 ? Math.round((totalPassed / totalAppeared) * 100) : 0,
            conversionRate: totalRegistrations > 0 ? Math.round((totalEnrolled / totalRegistrations) * 100) : 0
          },
          // Mobile-specific additions
          appliedCount: totalRegistrations,
          hasApplied: !!userRegistration,
          userRegistrationId: userRegistration?._id,
          registrationNumber: userRegistration?.registrationNumber,
        };
      })
    );

    // Return EXACT same structure as web dashboard
    res.status(200).json({
      success: true,
      total,
      page: 1,
      pages: 1, 
      exams: examsWithCounts
    });

  } catch (error) {
    console.error('Get all exams error:', error);
    res.status(500).json({ 
      message: "Server error" 
    });
  }
};

// Register for scholarship exam from mobile app
const registerForScholarshipExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { _id: userId, tenantId, studentId } = req.user;

    // Get user and student details  
    const user = req.user; // Already loaded by protect middleware
    let student;
    
    // Try to find student by studentId first (from JWT), then fallback to userId lookup
    if (studentId) {
      student = await Student.findById(studentId);
    } else {
      student = await Student.findOne({ userId, tenantId });
    }

    if (!user || !student) {
      console.log('❌ Mobile scholarship registration - User/Student not found:', {
        userId, studentId, tenantId, 
        hasUser: !!user, hasStudent: !!student,
        userEmail: user?.email,
        studentPhone: student?.phone
      });
      return res.status(404).json({
        success: false,
        message: 'User or student record not found',
        debug: { userId, studentId, tenantId, hasUser: !!user, hasStudent: !!student }
      });
    }

    console.log('✅ Found user and student for scholarship registration:', {
      userName: user.name,
      userEmail: user.email,
      studentName: student.name,
      studentPhone: student.phone,
      examId
    });

    // Find exam
    const exam = await ScholarshipExam.findOne({ 
      _id: examId,
      tenantId,
      status: "active",
      isPublic: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found or registration closed"
      });
    }

    // Check registration dates
    const now = new Date();
    if (now < new Date(exam.registrationStartDate)) {
      return res.status(400).json({
        success: false,
        message: "Registration has not started yet"
      });
    }
    if (now > new Date(exam.registrationEndDate)) {
      return res.status(400).json({
        success: false,
        message: "Registration has been closed"
      });
    }

    // Check if already registered
    const existing = await ExamRegistration.findOne({
      examId: exam._id,
      $or: [
        { email: user.email },
        { phone: student.phone },
        { userId: userId }
      ],
    });

    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: "You have already registered for this exam",
        registrationNumber: existing.registrationNumber,
      });
    }

    // Generate registration number
    const registrationCount = await ExamRegistration.countDocuments({ examId: exam._id });
    const registrationNumber = `${exam.examCode}${String(registrationCount + 1).padStart(4, '0')}`;

    // Create registration record
    const registrationData = {
      examId: exam._id,
      tenantId,
      userId,
      registrationNumber,
      studentName: student.name,
      email: user.email,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      fatherName: student.fatherName,
      motherName: student.motherName,
      address: student.address,
      currentClass: student.currentClass,
      school: student.school,
      gender: student.gender && ['male', 'female', 'other'].includes(student.gender) ? student.gender : 'other',
      category: student.category || 'general',
      registrationDate: new Date(),
      status: 'registered',
      registrationSource: 'mobile_app',
      paymentStatus: exam.registrationFee?.paymentRequired ? 'pending' : 'waived',
      feeAmount: exam.registrationFee?.amount || 0,
    };

    const registration = await ExamRegistration.create(registrationData);

    // Update exam statistics
    await ScholarshipExam.findByIdAndUpdate(exam._id, {
      $inc: { "stats.totalRegistrations": 1 }
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      registration: {
        _id: registration._id,
        registrationNumber: registration.registrationNumber,
        examName: exam.examName,
        examCode: exam.examCode,
        examDate: exam.examDate,
        registrationDate: registration.registrationDate,
        status: registration.status,
        paymentStatus: registration.paymentStatus,
        feeAmount: registration.feeAmount,
      }
    });

  } catch (error) {
    console.error('Mobile exam registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's scholarship registrations
const getMobileUserRegistrations = async (req, res) => {
  try {
    const { userId, tenantId } = req.user;

    const registrations = await ExamRegistration.find({
      userId,
      tenantId
    })
    .populate('examId', 'examName examCode examDate totalMarks passingMarks scholarshipDetails')
    .sort({ registrationDate: -1 })
    .lean();

    const registrationsWithDetails = registrations.map(reg => ({
      _id: reg._id,
      registrationNumber: reg.registrationNumber,
      registrationDate: reg.registrationDate,
      status: reg.status,
      paymentStatus: reg.paymentStatus,
      hasAttended: reg.hasAttended,
      marksObtained: reg.marksObtained,
      percentage: reg.percentage,
      rank: reg.rank,
      result: reg.result,
      rewardEligible: reg.rewardEligible,
      rewardDetails: reg.rewardDetails,
      enrollmentStatus: reg.enrollmentStatus,
      exam: {
        _id: reg.examId._id,
        examName: reg.examId.examName,
        examCode: reg.examId.examCode,
        examDate: reg.examId.examDate,
        totalMarks: reg.examId.totalMarks,
        passingMarks: reg.examId.passingMarks,
        scholarshipDetails: reg.examId.scholarshipDetails,
      }
    }));

    res.json({
      success: true,
      registrations: registrationsWithDetails
    });

  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
};

// Get registration details by registration number
const getRegistrationByNumber = async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    const { tenantId } = req.user;

    const registration = await ExamRegistration.findOne({
      registrationNumber,
      tenantId
    }).populate('examId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      registration: {
        _id: registration._id,
        registrationNumber: registration.registrationNumber,
        studentName: registration.studentName,
        email: registration.email,
        phone: registration.phone,
        registrationDate: registration.registrationDate,
        status: registration.status,
        paymentStatus: registration.paymentStatus,
        hasAttended: registration.hasAttended,
        marksObtained: registration.marksObtained,
        percentage: registration.percentage,
        rank: registration.rank,
        result: registration.result,
        rewardEligible: registration.rewardEligible,
        rewardDetails: registration.rewardDetails,
        exam: {
          examName: registration.examId.examName,
          examCode: registration.examId.examCode,
          examDate: registration.examId.examDate,
          totalMarks: registration.examId.totalMarks,
          passingMarks: registration.examId.passingMarks,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration details'
    });
  }
};

export {
  getMobileScholarshipExams,
  registerForScholarshipExam,
  getMobileUserRegistrations,
  getRegistrationByNumber
};