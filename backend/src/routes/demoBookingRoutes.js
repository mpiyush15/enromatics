import express from "express";
import {
  createDemoBooking,
  getAllDemoBookings,
  getDemoBookingById,
  updateDemoBooking,
  deleteDemoBooking,
  getAvailableTimeSlots,
} from "../controllers/demoBookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public route - Create demo booking
router.post("/", createDemoBooking);

// Get available time slots for a date
router.get("/available-slots", getAvailableTimeSlots);

// SuperAdmin routes (protected)
router.get("/", protect, authorizeRoles("SuperAdmin"), getAllDemoBookings);
router.get("/:id", protect, authorizeRoles("SuperAdmin"), getDemoBookingById);
router.put("/:id", protect, authorizeRoles("SuperAdmin"), updateDemoBooking);
router.delete("/:id", protect, authorizeRoles("SuperAdmin"), deleteDemoBooking);

export default router;
