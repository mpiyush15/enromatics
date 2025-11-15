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

    // Display name of the coaching institute / organization
    name: {
      type: String,
      required: true,
      trim: true,
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
      enum: ["free", "trial", "pro", "enterprise"],
      default: "free",
    },

    // Subscription details for the plan
    subscription: {
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled"],
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

    // Analytics and usage tracking (for future scaling)
    usage: {
      studentsCount: { type: Number, default: 0 },
      staffCount: { type: Number, default: 0 },
      adsCount: { type: Number, default: 0 },
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
