import express from "express";
import {
  createDemoBooking,
  getAllDemoBookings,
  getDemoBookingById,
  updateDemoBooking,
  deleteDemoBooking,
  getAvailableTimeSlots,
} from "../controllers/demoBookingController.js";
import { protectSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - Create demo booking
router.post("/", createDemoBooking);

// Get available time slots for a date
router.get("/available-slots", getAvailableTimeSlots);

// SuperAdmin routes
router.get("/", protectSuperAdmin, getAllDemoBookings);
router.get("/:id", protectSuperAdmin, getDemoBookingById);
router.put("/:id", protectSuperAdmin, updateDemoBooking);
router.delete("/:id", protectSuperAdmin, deleteDemoBooking);

export default router;
