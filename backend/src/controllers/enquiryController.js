/**
 * 📋 Enquiry Controller
 * Handles all enquiry/lead management operations
 * ✅ Multi-tenant ready - filters by tenantId
 * ✅ Connected to institute overview for data sync
 */

import Lead from "../models/Lead.js";

/**
 * 📋 GET ALL ENQUIRIES
 * @route   GET /api/enquiries
 * @access  Private
 */
export const getAllEnquiries = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) {
      return res.status(200).json({
        data: [],
        message: "Insufficient data available",
        dataAvailable: false
      });
    }

    const { status, page = 1, limit = 50, search = "" } = req.query;

    // Build filter
    const filter = { tenantId };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments(filter);
    const enquiries = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      data: enquiries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      dataAvailable: enquiries.length > 0
    });
  } catch (error) {
    console.error("[GetAllEnquiries] Error:", error.message);
    res.status(200).json({
      data: [],
      message: "Insufficient data available",
      dataAvailable: false
    });
  }
};

/**
 * 📋 GET ENQUIRY BY ID
 * @route   GET /api/enquiries/:id
 * @access  Private
 */
export const getEnquiryById = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    const { id } = req.params;

    if (!tenantId) {
      return res.status(200).json({
        data: null,
        message: "Insufficient data available",
        dataAvailable: false
      });
    }

    const enquiry = await Lead.findOne({
      _id: id,
      tenantId
    }).lean();

    if (!enquiry) {
      return res.status(200).json({
        data: null,
        message: "Enquiry not found",
        dataAvailable: false
      });
    }

    res.status(200).json({
      data: enquiry,
      dataAvailable: true
    });
  } catch (error) {
    console.error("[GetEnquiryById] Error:", error.message);
    res.status(200).json({
      data: null,
      message: "Insufficient data available",
      dataAvailable: false
    });
  }
};

/**
 * 📋 CREATE ENQUIRY
 * @route   POST /api/enquiries
 * @access  Private
 */
export const createEnquiry = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) {
      return res.status(200).json({
        success: false,
        message: "Insufficient data available",
        dataAvailable: false
      });
    }

    const { name, email, phone, course, status = "new", message, source = "web" } = req.body;

    const enquiry = new Lead({
      tenantId,
      name,
      email,
      phone,
      source,
      courseInterest: course,
      status,
      notes: message,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await enquiry.save();

    res.status(201).json({
      success: true,
      data: enquiry,
      message: "Enquiry created successfully"
    });
  } catch (error) {
    console.error("[CreateEnquiry] Error:", error.message);
    res.status(200).json({
      success: false,
      message: "Failed to create enquiry",
      dataAvailable: false
    });
  }
};

/**
 * 📋 UPDATE ENQUIRY
 * @route   PUT /api/enquiries/:id
 * @access  Private
 */
export const updateEnquiry = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    const { id } = req.params;
    const updateData = req.body;

    if (!tenantId) {
      return res.status(200).json({
        success: false,
        message: "Insufficient data available",
        dataAvailable: false
      });
    }

    // Ensure tenantId is not changed
    updateData.tenantId = tenantId;
    updateData.updatedAt = new Date();

    const enquiry = await Lead.findOneAndUpdate(
      { _id: id, tenantId },
      updateData,
      { new: true, lean: true }
    );

    if (!enquiry) {
      return res.status(200).json({
        success: false,
        message: "Enquiry not found",
        dataAvailable: false
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
      message: "Enquiry updated successfully"
    });
  } catch (error) {
    console.error("[UpdateEnquiry] Error:", error.message);
    res.status(200).json({
      success: false,
      message: "Failed to update enquiry",
      dataAvailable: false
    });
  }
};

/**
 * 📊 GET ENQUIRY STATISTICS
 * @route   GET /api/enquiries/stats
 * @access  Private
 * @returns { total, byStatus, conversionRate, activeLeads }
 */
export const getEnquiryStats = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) {
      return res.status(200).json({
        data: {
          total: 0,
          byStatus: { new: 0, contacted: 0, interested: 0, enrolled: 0, rejected: 0 },
          conversionRate: 0,
          activeLeads: 0
        },
        message: "Insufficient data available",
        dataAvailable: false
      });
    }

    const stats = await Lead.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          newEnquiries: {
            $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] }
          },
          contacted: {
            $sum: { $cond: [{ $eq: ["$status", "contacted"] }, 1, 0] }
          },
          interested: {
            $sum: { $cond: [{ $eq: ["$status", "interested"] }, 1, 0] }
          },
          enrolled: {
            $sum: { $cond: [{ $eq: ["$status", "enrolled"] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
          }
        }
      }
    ]);

    const data = stats[0] || {
      total: 0,
      newEnquiries: 0,
      contacted: 0,
      interested: 0,
      enrolled: 0,
      rejected: 0
    };

    const conversionRate = data.total > 0 
      ? Math.round((data.enrolled / data.total) * 100) 
      : 0;

    res.status(200).json({
      data: {
        total: data.total,
        byStatus: {
          new: data.newEnquiries,
          contacted: data.contacted,
          interested: data.interested,
          enrolled: data.enrolled,
          rejected: data.rejected
        },
        conversionRate,
        activeLeads: data.total - data.enrolled - data.rejected
      },
      dataAvailable: data.total > 0
    });
  } catch (error) {
    console.error("[GetEnquiryStats] Error:", error.message);
    res.status(200).json({
      data: {
        total: 0,
        byStatus: { new: 0, contacted: 0, interested: 0, enrolled: 0, rejected: 0 },
        conversionRate: 0,
        activeLeads: 0
      },
      message: "Insufficient data available",
      dataAvailable: false
    });
  }
};

/**
 * 📊 GET ENQUIRY TRENDS
 * @route   GET /api/enquiries/trends
 * @access  Private
 * @returns array of daily trends
 */
export const getEnquiryTrends = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    if (!tenantId) {
      return res.status(200).json({
        data: [],
        message: "Insufficient data available",
        dataAvailable: false
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await Lead.aggregate([
      {
        $match: {
          tenantId,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          newCount: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
          contactedCount: { $sum: { $cond: [{ $eq: ["$status", "contacted"] }, 1, 0] } },
          interestedCount: { $sum: { $cond: [{ $eq: ["$status", "interested"] }, 1, 0] } },
          enrolledCount: { $sum: { $cond: [{ $eq: ["$status", "enrolled"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      data: trends.map(t => ({
        date: t._id,
        total: t.count,
        new: t.newCount,
        contacted: t.contactedCount,
        interested: t.interestedCount,
        enrolled: t.enrolledCount
      })),
      dataAvailable: trends.length > 0
    });
  } catch (error) {
    console.error("[GetEnquiryTrends] Error:", error.message);
    res.status(200).json({
      data: [],
      message: "Insufficient data available",
      dataAvailable: false
    });
  }
};

/**
 * 📋 GET ENQUIRIES BY STATUS
 * @route   GET /api/enquiries/by-status/:status
 * @access  Private
 */
export const getEnquiryByStatus = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    const { status } = req.params;

    if (!tenantId) {
      return res.status(200).json({
        data: [],
        message: "Insufficient data available",
        dataAvailable: false
      });
    }

    const enquiries = await Lead.find({
      tenantId,
      status
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      data: enquiries,
      status,
      count: enquiries.length,
      dataAvailable: enquiries.length > 0
    });
  } catch (error) {
    console.error("[GetEnquiryByStatus] Error:", error.message);
    res.status(200).json({
      data: [],
      message: "Insufficient data available",
      dataAvailable: false
    });
  }
};
