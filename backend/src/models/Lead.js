// models/Lead.js
import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
export default Lead;
