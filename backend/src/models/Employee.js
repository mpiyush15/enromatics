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
    enum: ["teacher", "staff", "counsellor", "manager"] 

     },

  salary: Number,

  joiningDate: Date,

  status: { type: String, default: "active" },
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);
