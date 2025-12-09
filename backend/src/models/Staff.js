import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Personal Information
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
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

    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // Employment Details
    employeeId: {
      type: String,
      required: true,
      // Note: unique: true removed - uniqueness is enforced by compound index { tenantId: 1, employeeId: 1 }
    },

    role: {
      type: String,
      enum: [
        "teacher",
        "staff",
        "accountant",
        "admissionIncharge",
        "counsellor",
        "receptionist",
        "librarian",
        "labAssistant",
        "manager",
        "other"
      ],
      required: true,
    },

    department: {
      type: String,
      enum: [
        "academics",
        "administration",
        "accounts",
        "admission",
        "counselling",
        "library",
        "laboratory",
        "management",
        "other"
      ],
    },

    designation: {
      type: String,
    },

    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    employmentType: {
      type: String,
      enum: ["fullTime", "partTime", "contract", "temporary"],
      default: "fullTime",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "onLeave", "terminated"],
      default: "active",
    },

    // Salary Information
    salary: {
      basic: {
        type: Number,
        default: 0,
      },
      allowances: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
      paymentMode: {
        type: String,
        enum: ["monthly", "weekly", "daily", "hourly"],
        default: "monthly",
      },
    },

    // Bank Details
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
    },

    // Permissions & Access
    permissions: {
      canManageStudents: {
        type: Boolean,
        default: false,
      },
      canMarkAttendance: {
        type: Boolean,
        default: false,
      },
      canManageAccounts: {
        type: Boolean,
        default: false,
      },
      canManageAdmissions: {
        type: Boolean,
        default: false,
      },
      canViewReports: {
        type: Boolean,
        default: false,
      },
      canManageExams: {
        type: Boolean,
        default: false,
      },
    },

    // Subjects/Courses (for teachers)
    assignedSubjects: [
      {
        type: String,
      },
    ],

    assignedBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],

    // Documents
    documents: [
      {
        name: String,
        type: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Emergency Contact
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },

    // Qualifications
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
        percentage: Number,
      },
    ],

    // Experience
    previousExperience: {
      type: Number, // in years
      default: 0,
    },

    // Notes
    notes: {
      type: String,
    },

    // Attendance tracking
    leaveBalance: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 12 },
      earned: { type: Number, default: 0 },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
staffSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });
staffSchema.index({ tenantId: 1, email: 1 });
staffSchema.index({ tenantId: 1, role: 1 });
staffSchema.index({ tenantId: 1, status: 1 });

// Pre-save middleware to calculate total salary
staffSchema.pre("save", function (next) {
  if (this.salary.basic !== undefined || this.salary.allowances !== undefined) {
    this.salary.total = (this.salary.basic || 0) + (this.salary.allowances || 0);
  }
  next();
});

const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

export default Staff;
