import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({

  tenantId: { 
    
    type: String, 
    required: true },

  name: String,

  email: String,

  phone: String,

  role: { 
    
    type: String, 
    enum: ["teacher", "staff", "counsellor", "manager", "accountant", "marketing"] 

     },

  salary: Number,

  joiningDate: Date,

  status: { type: String, default: "active" },

  // Permissions for staff members and other roles
  permissions: {
    canAccessStudents: { type: Boolean, default: false },
    canAccessTests: { type: Boolean, default: false },
    canCreateFees: { type: Boolean, default: false },
    canAccessAccounts: { type: Boolean, default: false },
    canViewStudentDetails: { type: Boolean, default: false }, // For accountant to view student financial details
    canViewTransactions: { type: Boolean, default: false },   // For accountant to view all transactions
    canManageFees: { type: Boolean, default: false },         // For accountant to manage fees
  },

}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
