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

// Foreign key validation: Ensure tenantId exists in Tenant collection
employeeSchema.pre("save", async function (next) {
  if (!this.tenantId) {
    return next(new Error("tenantId is required"));
  }

  // Check if tenant exists (only on insert or if tenantId is modified)
  if (this.isNew || this.isModified("tenantId")) {
    const { default: Tenant } = await import('./Tenant.js');
    const tenant = await Tenant.findOne({ tenantId: this.tenantId });
    
    if (!tenant) {
      return next(new Error(`Invalid tenantId: Tenant "${this.tenantId}" does not exist`));
    }
  }

  next();
});

export default mongoose.model("Employee", employeeSchema);
