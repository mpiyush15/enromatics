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
      unique: true,
      uppercase: true,
      sparse: true, // Allow multiple documents with null/undefined examCode during creation
    },

    description: {
      type: String,
    },

    goal: {
      type: String,
      enum: ["NEET", "JEE", "MHT-CET"],
    },

    registrationCount: {
      type: Number,
      default: 0,
    },

    tenantWebsite: {
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
      minAge: {
        type: Number,
        default: 10,
      },
      maxAge: {
        type: Number,  
        default: 18,
      },
      eligibleClasses: {
        type: [String],
        default: [],
      },
      qualification: {
        type: String,
        default: "",
      },
    },

    // Registration Form Fields
    formFields: {
      collectPhoto: {
        type: Boolean,
        default: true,
      },
      collectDateOfBirth: {
        type: Boolean,
        default: true,
      },
      collectGender: {
        type: Boolean,
        default: true,
      },
      collectParentDetails: {
        type: Boolean,
        default: true,
      },
      collectCurrentClass: {
        type: Boolean,
        default: true,
      },
      collectSchool: {
        type: Boolean,
        default: true,
      },
      collectAddress: {
        type: Boolean,
        default: true,
      },
      collectPreviousMarks: {
        type: Boolean,
        default: false,
      },
      collectAadhar: {
        type: Boolean,
        default: false,
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
        rankFrom: {
          type: Number,
          required: true,
        },
        rankTo: {
          type: Number,
          required: true,
        },
        rewardType: {
          type: String,
          enum: ["percentage", "fixed", "certificate"],
          required: true,
        },
        rewardValue: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
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
  try {
    if (!this.examCode && this.isNew) {
      const year = new Date().getFullYear().toString().slice(-2);
      const count = await mongoose.model("ScholarshipExam").countDocuments({ tenantId: this.tenantId });
      let examCode;
      let attempts = 0;
      
      // Generate unique exam code with retry logic
      do {
        const sequence = count + attempts + 1;
        examCode = `EXAM${year}${String(sequence).padStart(4, "0")}`;
        const existing = await mongoose.model("ScholarshipExam").findOne({ examCode });
        if (!existing) {
          this.examCode = examCode;
          break;
        }
        attempts++;
      } while (attempts < 10);
      
      if (!this.examCode) {
        // Fallback with timestamp
        this.examCode = `EXAM${year}${Date.now().toString().slice(-4)}`;
      }
      
      console.log(`✅ Generated examCode: ${this.examCode} for tenant: ${this.tenantId}`);
    }
    next();
  } catch (error) {
    console.error("❌ Error generating examCode:", error);
    next(error);
  }
});

const ScholarshipExam = mongoose.models.ScholarshipExam || mongoose.model("ScholarshipExam", scholarshipExamSchema);

export default ScholarshipExam;
