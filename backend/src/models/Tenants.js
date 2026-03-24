// models/Tenant.js
import mongoose from "mongoose";
import ENUMS from '../config/ENUMS_CONSTANTS.js';

const subscriptionSchema = new mongoose.Schema({
  status: { type: String, enum: ["active", "inactive"], default: "inactive" },
  paymentId: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
});

const tenantSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    instituteName: { type: String },
    email: { type: String, required: true },
    website: { type: String },
    description: { type: String },
    plan: { type: String, enum: ENUMS.SUBSCRIPTION_PLANS, default: "trial" },
    active: { type: Boolean, default: true },
    contact: {
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: "India" },
    },
    subscription: subscriptionSchema,
  },
  { timestamps: true }
);

const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);
export default Tenant;


