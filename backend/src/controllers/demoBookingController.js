import DemoBooking from "../models/DemoBooking.js";

// Create demo booking
export const createDemoBooking = async (req, res) => {
  try {
    const { name, email, phone, message, demoDate, demoTime, timeSlot } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !demoDate || !demoTime || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check if demo booking already exists for same email and date
    const existingBooking = await DemoBooking.findOne({
      email,
      demoDate: new Date(demoDate).toDateString(),
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have a demo booking for this date",
      });
    }

    const demoBooking = new DemoBooking({
      name,
      email,
      phone,
      message: message || "",
      demoDate: new Date(demoDate),
      demoTime,
      timeSlot,
      status: "pending",
    });

    await demoBooking.save();

    res.status(201).json({
      success: true,
      message: "Demo booking created successfully",
      data: demoBooking,
    });
  } catch (error) {
    console.error("Error creating demo booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating demo booking",
      error: error.message,
    });
  }
};

// Get all demo bookings (SuperAdmin only)
export const getAllDemoBookings = async (req, res) => {
  try {
    const { status, sortBy } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === "date") {
      sortOption = { demoDate: -1 };
    }

    const demoBookings = await DemoBooking.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: demoBookings.length,
      data: demoBookings,
    });
  } catch (error) {
    console.error("Error fetching demo bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching demo bookings",
      error: error.message,
    });
  }
};

// Get demo booking by ID
export const getDemoBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const demoBooking = await DemoBooking.findById(id);

    if (!demoBooking) {
      return res.status(404).json({
        success: false,
        message: "Demo booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: demoBooking,
    });
  } catch (error) {
    console.error("Error fetching demo booking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching demo booking",
      error: error.message,
    });
  }
};

// Update demo booking status
export const updateDemoBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, meetingLink } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (meetingLink) updateData.meetingLink = meetingLink;

    const demoBooking = await DemoBooking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!demoBooking) {
      return res.status(404).json({
        success: false,
        message: "Demo booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Demo booking updated successfully",
      data: demoBooking,
    });
  } catch (error) {
    console.error("Error updating demo booking:", error);
    res.status(500).json({
      success: false,
      message: "Error updating demo booking",
      error: error.message,
    });
  }
};

// Delete demo booking
export const deleteDemoBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const demoBooking = await DemoBooking.findByIdAndDelete(id);

    if (!demoBooking) {
      return res.status(404).json({
        success: false,
        message: "Demo booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Demo booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting demo booking:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting demo booking",
      error: error.message,
    });
  }
};

// Get available time slots for a specific date
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get booked slots for the date
    const bookedBookings = await DemoBooking.find({
      demoDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status: { $in: ["pending", "confirmed"] },
    });

    const timeSlots = [
      "09:00 AM - 09:30 AM",
      "09:30 AM - 10:00 AM",
      "10:00 AM - 10:30 AM",
      "10:30 AM - 11:00 AM",
      "11:00 AM - 11:30 AM",
      "11:30 AM - 12:00 PM",
      "12:00 PM - 12:30 PM",
      "12:30 PM - 01:00 PM",
      "02:00 PM - 02:30 PM",
      "02:30 PM - 03:00 PM",
      "03:00 PM - 03:30 PM",
      "03:30 PM - 04:00 PM",
      "04:00 PM - 04:30 PM",
      "04:30 PM - 05:00 PM",
      "05:00 PM - 05:30 PM",
      "05:30 PM - 06:00 PM",
    ];

    const bookedSlots = bookedBookings.map((booking) => booking.timeSlot);
    const availableSlots = timeSlots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      availableSlots,
      bookedSlots,
    });
  } catch (error) {
    console.error("Error fetching available time slots:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available time slots",
      error: error.message,
    });
  }
};
