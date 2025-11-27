const mongoose = require("mongoose");

const DemoBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: "",
    },
    demoDate: {
      type: Date,
      required: true,
    },
    demoTime: {
      type: String, // Format: "HH:MM" (24-hour)
      required: true,
    },
    timeSlot: {
      type: String, // e.g., "10:00 AM - 10:30 AM"
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    meetingLink: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DemoBooking", DemoBookingSchema);
