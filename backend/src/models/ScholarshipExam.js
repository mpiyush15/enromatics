import mongoose from "mongoose";

const scholarshipExamSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Exam Details
    examName: {
      type: String,
      required: true,
    },

    examCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    description: {
      type: String,
    },

    // Exam Dates
    registrationStartDate: {
      type: Date,
      required: true,
    },

    registrationEndDate: {
      type: Date,
      required: true,
    },

    examDate: {
      type: Date,
      required: true,
    },

    examDates: {
      type: [Date],
      default: [],
    },

    resultDate: {
      type: Date,
    },

    // Exam Configuration
    examDuration: {
      type: Number, // in minutes
      default: 120,
    },

    totalMarks: {
      type: Number,
      default: 100,
    },

    passingMarks: {
      type: Number,
      default: 40,
    },

    examMode: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      default: "offline",
    },

    venue: {
      type: String,
    },

    // Eligibility
    eligibilityCriteria: {
      minAge: Number,
      maxAge: Number,
      qualification: String,
      class: String,
    },

    // Registration Form Fields
    formFields: {
      collectPhoto: {
        type: Boolean,
        default: true,
      },
      collectAadhar: {
        type: Boolean,
        default: false,
      },
      collectPreviousMarks: {
        type: Boolean,
        default: true,
      },
      customFields: [
        {
          fieldName: String,
          fieldType: String, // text, number, dropdown, checkbox
          required: Boolean,
          options: [String],
        },
      ],
    },

    // Scholarship/Rewards Structure
    rewards: [
      {
        rank: String, // "1", "2-5", "6-10", etc.
        rewardType: String, // "scholarship", "discount", "certificate"
        rewardValue: String, // "100%", "50%", "Rs. 5000"
        description: String,
      },
    ],

    // Registration Fee
    registrationFee: {
      amount: {
        type: Number,
        default: 0,
      },
      paymentRequired: {
        type: Boolean,
        default: false,
      },
    },

    // Landing Page Customization
    landingPage: {
      heroTitle: String,
      heroSubtitle: String,
      aboutExam: String,
      syllabus: String,
      importantDates: String,
      bannerImage: String,
      primaryColor: {
        type: String,
        default: "#3B82F6",
      },
      secondaryColor: {
        type: String,
        default: "#8B5CF6",
      },
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "active", "registrationClosed", "examCompleted", "resultPublished", "archived"],
      default: "draft",
    },

    // Results
    resultsPublished: {
      type: Boolean,
      default: false,
    },

    resultsPublishedDate: {
      type: Date,
    },

    // Statistics
    stats: {
      totalRegistrations: {
        type: Number,
        default: 0,
      },
      totalAppearedStudents: {
        type: Number,
        default: 0,
      },
      passedStudents: {
        type: Number,
        default: 0,
      },
      totalEnrollments: {
        type: Number,
        default: 0,
      },
    },

    // SEO & Sharing
    metaTitle: String,
    metaDescription: String,
    shareImage: String,

    // Access Control
    isPublic: {
      type: Boolean,
      default: true,
    },

    requiresApproval: {
      type: Boolean,
      default: false,
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
scholarshipExamSchema.index({ tenantId: 1, examCode: 1 }, { unique: true });
scholarshipExamSchema.index({ tenantId: 1, status: 1 });
scholarshipExamSchema.index({ examDate: 1 });

// Generate unique exam code
scholarshipExamSchema.pre("save", async function (next) {
  if (!this.examCode && this.isNew) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await mongoose.model("ScholarshipExam").countDocuments({ tenantId: this.tenantId });
    this.examCode = `EXAM${year}${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

const ScholarshipExam = mongoose.models.ScholarshipExam || mongoose.model("ScholarshipExam", scholarshipExamSchema);

export default ScholarshipExam;
