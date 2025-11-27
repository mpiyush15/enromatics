const express = require("express");
const router = express.Router();
const {
  createDemoBooking,
  getAllDemoBookings,
  getDemoBookingById,
  updateDemoBooking,
  deleteDemoBooking,
  getAvailableTimeSlots,
} = require("../controllers/demoBookingController");
const { protectSuperAdmin } = require("../middleware/authMiddleware");

// Public route - Create demo booking
router.post("/", createDemoBooking);

// Get available time slots for a date
router.get("/available-slots", getAvailableTimeSlots);

// SuperAdmin routes
router.get("/", protectSuperAdmin, getAllDemoBookings);
router.get("/:id", protectSuperAdmin, getDemoBookingById);
router.put("/:id", protectSuperAdmin, updateDemoBooking);
router.delete("/:id", protectSuperAdmin, deleteDemoBooking);

module.exports = router;
