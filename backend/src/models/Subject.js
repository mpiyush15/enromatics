import mongoose from "mongoose";
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tenantId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ENUMS.SUBJECT_STATUS,
      default: "active",
    },
  },
  { timestamps: true }
);

// Index for faster queries
subjectSchema.index({ tenantId: 1, name: 1 });

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
