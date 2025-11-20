import mongoose from "mongoose";

const examRegistrationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScholarshipExam",
      required: true,
    },

    // Registration Details
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },

    // Student Personal Info
    studentName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    fatherName: String,
    motherName: String,
    parentPhone: String,
    parentEmail: String,

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // Academic Details
    currentClass: String,
    school: String,
    previousMarks: String,
    qualification: String,

    // Documents
    photoUrl: String,
    aadharNumber: String,
    documents: [
      {
        name: String,
        type: String,
        url: String,
      },
    ],

    // Custom Fields
    customFieldValues: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },

    // Preferred Exam Date
    preferredExamDate: {
      type: Date,
    },

    // Student's Goal/Target
    goal: {
      type: String,
      enum: ["NEET", "JEE", "MHT-CET"],
    },

    // Login Credentials (for student portal)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Exam Attempt
    hasAttended: {
      type: Boolean,
      default: false,
    },

    examDateAttended: {
      type: Date,
    },

    attendanceMarked: {
      type: Boolean,
      default: false,
    },

    // Results
    marksObtained: {
      type: Number,
    },

    percentage: {
      type: Number,
    },

    rank: {
      type: Number,
    },

    result: {
      type: String,
      enum: ["pass", "fail", "absent", "pending"],
      default: "pending",
    },

    // Rewards
    rewardEligible: {
      type: Boolean,
      default: false,
    },

    rewardDetails: {
      rewardType: String,
      rewardValue: String,
      description: String,
    },

    // Enrollment Status
    enrollmentStatus: {
      type: String,
      enum: ["notInterested", "interested", "enrolled", "converted"],
      default: "notInterested",
    },

    enrollmentDate: Date,

    convertedToStudent: {
      type: Boolean,
      default: false,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },

    // Payment
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "waived"],
      default: "pending",
    },

    paymentAmount: Number,
    paymentDate: Date,
    paymentId: String,

    // Status
    status: {
      type: String,
      enum: ["registered", "approved", "rejected", "appeared", "resultPublished", "enrolled"],
      default: "registered",
    },

    // Remarks
    remarks: String,
    adminNotes: String,

    // Timestamps
    registeredAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Lead Source
    source: {
      type: String,
      default: "examRegistration",
    },

    // Consent
    termsAccepted: {
      type: Boolean,
      default: true,
    },

    whatsappConsent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
examRegistrationSchema.index({ tenantId: 1, examId: 1 });
examRegistrationSchema.index({ tenantId: 1, registrationNumber: 1 }, { unique: true });
examRegistrationSchema.index({ email: 1, examId: 1 });
examRegistrationSchema.index({ phone: 1 });
examRegistrationSchema.index({ status: 1 });
examRegistrationSchema.index({ enrollmentStatus: 1 });

// Generate unique registration number
examRegistrationSchema.pre("save", async function (next) {
  try {
    if (!this.registrationNumber && this.isNew) {
      const exam = await mongoose.model("ScholarshipExam").findById(this.examId);
      if (!exam) {
        return next(new Error('Exam not found'));
      }
      
      const count = await mongoose.model("ExamRegistration").countDocuments({ examId: this.examId });
      this.registrationNumber = `${exam.examCode}-${String(count + 1).padStart(5, "0")}`;
      
      console.log(`Generated registration number: ${this.registrationNumber} for exam ${exam.examCode}`);
    }

    // Generate username for student portal
    if (!this.username && this.isNew) {
      const baseUsername = this.email.split("@")[0].toLowerCase();
      let username = baseUsername;
      let counter = 1;
      
      while (await mongoose.model("ExamRegistration").findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      this.username = username;
      console.log(`Generated username: ${this.username}`);
    }

    next();
  } catch (error) {
    console.error('Pre-save hook error:', error);
    next(error);
  }
});

const ExamRegistration = mongoose.models.ExamRegistration || mongoose.model("ExamRegistration", examRegistrationSchema);

export default ExamRegistration;
