import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({

  tenantId: { type: String, required: true },

  planId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Plan" 
    },

  startDate: Date,

  endDate: Date,

  status: { type: String, default: "active" },

}, 

{ timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);
