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

  // Permissions for staff members
  permissions: {
    canAccessStudents: { type: Boolean, default: false },
    canAccessTests: { type: Boolean, default: false },
    canCreateFees: { type: Boolean, default: false },
    canAccessAccounts: { type: Boolean, default: false }, // Will be blocked for staff role
  },

}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
