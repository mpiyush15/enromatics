// models/Tenant.js
import mongoose from "mongoose";

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
    email: { type: String, required: true },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    active: { type: Boolean, default: true },
    subscription: subscriptionSchema,
  },
  { timestamps: true }
);

const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);
export default Tenant;


