import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// User schema definition
const userSchema = new mongoose.Schema(
  {
    // User attributes
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: { type: String, required: true, minlength: 6 },

    phone: { type: String, sparse: true }, // Optional phone number

    whatsappOptIn: { type: Boolean, default: false }, // Consent for WhatsApp messages

    tenantId: { type: String, required: true },

    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "tenantAdmin", "employee", "student", "adsManager", "teacher", "staff", "manager", "counsellor", "accountant", "marketing"],
      default: "tenantAdmin", // every new signup = tenant admin by default
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    // Subscription/Trial fields
    plan: {
      type: String,
      enum: ["trial", "free", "starter", "professional", "enterprise"],
      default: "trial",
    },

    trialStartDate: {
      type: Date,
      default: Date.now,
    },

    trialEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },

    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "expired", "cancelled"],
      default: "trial",
    },

    subscriptionEndDate: {
      type: Date,
    },

    paymentDetails: {
      lastPaymentDate: Date,
      lastPaymentAmount: Number,
      paymentMethod: String,
    },

    // Session management for concurrent login prevention
    activeSessionId: {
      type: String,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: Date.now,
    },

    // Force password reset on first login (for auto-generated passwords)
    requirePasswordReset: {
      type: Boolean,
      default: false,
    },

    // Facebook Business Integration
    facebookBusiness: {
      connected: { type: Boolean, default: false },
      facebookUserId: { type: String },
      accessToken: { type: String },
      tokenExpiry: { type: Date },
      permissions: [{ type: String }],
      connectedAt: { type: Date },
      lastSyncAt: { type: Date }
    },
  },
  { timestamps: true }
);

// Indexes for performance (email unique index already exists, tenantId added below)
userSchema.index({ tenantId: 1 });

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password verification method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from API responses
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Virtual relationship to Tenant (future proof)
userSchema.virtual("tenant", {
  ref: "Tenant",
  localField: "tenantId",
  foreignField: "tenantId",
  justOne: true,
});

// User model creation
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Exporting user model
export default User;
