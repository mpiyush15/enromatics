import mongoose from "mongoose";

/**
 * Tenant Schema
 * Represents each coaching institute (client) using Enro Matics.
 * Every tenant has its own users, students, and staff associated via tenantId.
 */

const tenantSchema = new mongoose.Schema(
  {
    // Unique tenant identifier used to link all data
    tenantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Owner/Tenant person name (e.g., "John Smith")
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Institute/Organization name (e.g., "ABC Coaching Institute")
    instituteName: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },

    // Owner (tenantAdmin) email address
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    // Plan type: free, pro, enterprise
    plan: {
      type: String,
      enum: ["free", "trial", "test", "starter", "professional", "pro", "enterprise"],
      default: "free",
    },

    // Subscription details for the plan
    subscription: {
      status: {
        type: String,
        enum: ["active", "trial", "inactive", "cancelled"],
        default: "inactive",
      },
      paymentId: {
        type: String,
        default: null,
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      trialStartDate: {
        type: Date,
        default: null,
      },
      // Billing cycle - monthly or annual
      billingCycle: {
        type: String,
        enum: ["monthly", "annual", "yearly"],
        default: "monthly",
      },
      // Actual amount paid in INR
      amount: {
        type: Number,
        default: 0,
      },
      // Currency (defaults to INR)
      currency: {
        type: String,
        default: "INR",
      },
      // Invoice number (auto-generated sequential)
      invoiceNumber: {
        type: Number,
        default: null,
      },
      // S3 URL for the invoice PDF
      invoicePdfUrl: {
        type: String,
        default: null,
      },
    },

    // Whether tenant account is active or suspended
    active: {
      type: Boolean,
      default: true,
    },

    // Optional contact information for admin use
    contact: {
      phone: { type: String, default: null },
      address: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: "India" },
    },

    // WhatsApp consent for marketing messages
    whatsappOptIn: {
      type: Boolean,
      default: true, // Default to true for existing tenants
    },

    // Analytics and usage tracking (for future scaling)
    usage: {
      studentsCount: { type: Number, default: 0 },
      staffCount: { type: Number, default: 0 },
      adsCount: { type: Number, default: 0 },
    },

    // Branding and subdomain configuration
    subdomain: {
      type: String,
      default: null,
      index: true,
    },
    branding: {
      logoUrl: { type: String, default: null },
      themeColor: { type: String, default: "#2F6CE5" },
      appName: { type: String, default: null },
    },
  },
  { timestamps: true }
);

/**
 * Virtual: users
 * Helps populate all users belonging to this tenant (if needed).
 */
tenantSchema.virtual("users", {
  ref: "User",
  localField: "tenantId",
  foreignField: "tenantId",
});

// Ensure virtuals are included in JSON responses
tenantSchema.set("toJSON", { virtuals: true });
tenantSchema.set("toObject", { virtuals: true });

// Model creation
const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);

export default Tenant;
