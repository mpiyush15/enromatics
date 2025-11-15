import mongoose from "mongoose";

const planSchema = new mongoose.Schema({

  name: { type: String, required: true },

  price: Number,

  features: [String],
  
  duration: { type: Number, default: 30 }, // days
}, { timestamps: true });

export default mongoose.model("Plan", planSchema);
