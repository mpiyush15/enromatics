import DemoRequest from "../models/DemoRequest.js";

/**
 * 🔹 1. Create Demo Request
 */
export const createDemoRequest = async (req, res) => {
  try {
    const { name, email, phone, company, message, demoDateTime, date, time } =
      req.body;

    // Validate required fields
    if (!name || !email || !phone || !company || !demoDateTime) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Check if email already has a pending demo
    const existingDemo = await DemoRequest.findOne({
      email,
      status: "pending",
    });

    if (existingDemo) {
      return res.status(409).json({
        message: "You already have a pending demo request",
      });
    }

    // Create new demo request
    const demoRequest = new DemoRequest({
      name,
      email,
      phone,
      company,
      message: message || "",
      demoDateTime: new Date(demoDateTime),
      date,
      time,
      status: "pending",
    });

    await demoRequest.save();

    console.log("✅ Demo request created:", demoRequest._id);

    res.status(201).json({
      message: "Demo request created successfully",
      demoRequest,
    });
  } catch (err) {
    console.error("❌ Create Demo Request Error:", err);
    res.status(500).json({
      message: "Failed to create demo request",
      error: err.message,
    });
  }
};

/**
 * 🔹 2. Get All Demo Requests (SuperAdmin Only)
 */
export const getAllDemoRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const demoRequests = await DemoRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DemoRequest.countDocuments(filter);

    res.status(200).json({
      message: "Demo requests retrieved successfully",
      demoRequests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ Get All Demo Requests Error:", err);
    res.status(500).json({
      message: "Failed to fetch demo requests",
      error: err.message,
    });
  }
};

/**
 * 🔹 3. Get Single Demo Request
 */
export const getDemoRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const demoRequest = await DemoRequest.findById(id);

    if (!demoRequest) {
      return res.status(404).json({
        message: "Demo request not found",
      });
    }

    res.status(200).json({
      message: "Demo request retrieved successfully",
      demoRequest,
    });
  } catch (err) {
    console.error("❌ Get Demo Request Error:", err);
    res.status(500).json({
      message: "Failed to fetch demo request",
      error: err.message,
    });
  }
};

/**
 * 🔹 4. Update Demo Request Status (SuperAdmin Only)
 */
export const updateDemoRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const demoRequest = await DemoRequest.findByIdAndUpdate(
      id,
      {
        status,
        notes: notes || demoRequest.notes,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!demoRequest) {
      return res.status(404).json({
        message: "Demo request not found",
      });
    }

    console.log("✅ Demo request updated:", id, "Status:", status);

    res.status(200).json({
      message: "Demo request updated successfully",
      demoRequest,
    });
  } catch (err) {
    console.error("❌ Update Demo Request Error:", err);
    res.status(500).json({
      message: "Failed to update demo request",
      error: err.message,
    });
  }
};

/**
 * 🔹 5. Delete Demo Request (SuperAdmin Only)
 */
export const deleteDemoRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const demoRequest = await DemoRequest.findByIdAndDelete(id);

    if (!demoRequest) {
      return res.status(404).json({
        message: "Demo request not found",
      });
    }

    console.log("✅ Demo request deleted:", id);

    res.status(200).json({
      message: "Demo request deleted successfully",
    });
  } catch (err) {
    console.error("❌ Delete Demo Request Error:", err);
    res.status(500).json({
      message: "Failed to delete demo request",
      error: err.message,
    });
  }
};

/**
 * 🔹 6. Get Demo Stats
 */
export const getDemoStats = async (req, res) => {
  try {
    const stats = await DemoRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRequests = await DemoRequest.countDocuments();

    res.status(200).json({
      message: "Demo stats retrieved successfully",
      stats: {
        total: totalRequests,
        byStatus: stats.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    console.error("❌ Get Demo Stats Error:", err);
    res.status(500).json({
      message: "Failed to fetch demo stats",
      error: err.message,
    });
  }
};
