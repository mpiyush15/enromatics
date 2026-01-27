import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema({
  // User-like fields (unified auth)
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true, // for linking mobile registrations to user accounts
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: false,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
  },
  whatsappOptIn: { 
    type: Boolean, 
    default: false 
  },
  role: {
    type: String,
    enum: ["student", "staff", "teacher"],
    default: "student",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  plan: {
    type: String,
    enum: ["trial", "free", "starter", "professional", "enterprise"],
    default: "free",
  },
  subscriptionStatus: {
    type: String,
    enum: ["trial", "active", "expired", "cancelled"],
    default: "active",
  },
  subscriptionEndDate: {
    type: Date,
  },

  // Student-specific fields
  gender: {
    type: String,
    enum: ["male", "female", "other", "Male", "Female", "Other"],
  },
  course: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    default: null,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  address: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  fees: {
    type: Number,
    default: 0,
  },
  profilePicture: {
    type: String,
  },
  balance: {
    type: Number,
    default: 0,
  },
  rollNumber: {
    type: String,
    index: true,
  },
}, { timestamps: true });

// Hash password before save if present
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Performance indexes for common queries
studentSchema.index({ tenantId: 1, email: 1 });
studentSchema.index({ tenantId: 1, status: 1 });
studentSchema.index({ tenantId: 1, course: 1 });
studentSchema.index({ tenantId: 1, batchId: 1 });
studentSchema.index({ tenantId: 1, createdAt: -1 });
studentSchema.index({ tenantId: 1, name: 'text' }); // Text search for student names

export default mongoose.model("Student", studentSchema, "students");
