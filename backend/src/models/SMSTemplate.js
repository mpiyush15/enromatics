import mongoose from "mongoose";
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const smsTemplateSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    templateName: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: 160,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    variables: [String],

    createdBy: String,

    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

smsTemplateSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model("SMSTemplate", smsTemplateSchema);
