import express from "express";
import Lead from "../models/Lead.js";
import CallLog from "../models/CallLog.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// ============================================
// 📊 DASHBOARD & ANALYTICS
// ============================================

/**
 * @route GET /api/leads/dashboard
 * @desc Get lead dashboard stats (counts by status, source, today's follow-ups)
 * @access Private - tenantAdmin, counsellor, manager
 */
router.get(
  "/dashboard",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor", "staff"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get counts by status
      const statusCounts = await Lead.aggregate([
        { $match: { tenantId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      // Get counts by source
      const sourceCounts = await Lead.aggregate([
        { $match: { tenantId } },
        { $group: { _id: "$source", count: { $sum: 1 } } },
      ]);

      // Today's follow-ups
      const todaysFollowUps = await Lead.countDocuments({
        tenantId,
        nextFollowUpDate: { $gte: today, $lt: tomorrow },
      });

      // Overdue follow-ups
      const overdueFollowUps = await Lead.countDocuments({
        tenantId,
        nextFollowUpDate: { $lt: today },
        status: { $nin: ["converted", "lost"] },
      });

      // This week's conversions
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weeklyConversions = await Lead.countDocuments({
        tenantId,
        status: "converted",
        conversionDate: { $gte: weekStart },
      });

      // Total leads
      const totalLeads = await Lead.countDocuments({ tenantId });

      res.json({
        totalLeads,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        sourceCounts: sourceCounts.reduce((acc, item) => {
          acc[item._id || "unknown"] = item.count;
          return acc;
        }, {}),
        todaysFollowUps,
        overdueFollowUps,
        weeklyConversions,
      });
    } catch (err) {
      console.error("❌ Lead Dashboard Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// ============================================
// 📋 LEAD CRUD OPERATIONS
// ============================================

/**
 * @route POST /api/leads
 * @desc Create a new lead
 * @access Private - tenantAdmin, counsellor, manager, staff
 */
router.post(
  "/",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor", "staff"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const {
        name,
        phone,
        email,
        source,
        sourceDetails,
        interestedCourse,
        interestedBatch,
        priority,
        notes,
        tags,
        address,
        city,
        qualification,
        dateOfBirth,
        parentName,
        parentPhone,
        expectedFees,
      } = req.body;

      if (!name || !phone) {
        return res.status(400).json({ message: "Name and Phone are required" });
      }

      // Check for duplicate phone in same tenant
      const existingLead = await Lead.findOne({ tenantId, phone });
      if (existingLead) {
        return res.status(400).json({
          message: "A lead with this phone number already exists",
          existingLead: {
            _id: existingLead._id,
            name: existingLead.name,
            status: existingLead.status,
          },
        });
      }

      const lead = await Lead.create({
        tenantId,
        name,
        phone,
        email,
        source: source || "other",
        sourceDetails,
        interestedCourse,
        interestedBatch,
        priority: priority || "medium",
        notes,
        tags: tags || [],
        address,
        city,
        qualification,
        dateOfBirth,
        parentName,
        parentPhone,
        expectedFees,
        status: "new",
      });

      res.status(201).json({
        message: "Lead created successfully ✅",
        lead,
      });

      console.log("📥 New Lead Added:", lead.name);
    } catch (err) {
      console.error("❌ Lead Creation Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route POST /api/leads/add
 * @desc Create a new lead (legacy endpoint for backward compatibility)
 * @access Private
 */
router.post(
  "/add",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor", "staff"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { name, mobile, phone, email, source } = req.body;

      const leadPhone = phone || mobile;
      if (!name || !leadPhone) {
        return res.status(400).json({ message: "Name and Phone/Mobile are required" });
      }

      const lead = await Lead.create({
        tenantId,
        name,
        phone: leadPhone,
        email,
        source: source || "other",
        status: "new",
      });

      res.status(201).json({
        message: "Lead created successfully ✅",
        lead,
      });
    } catch (err) {
      console.error("❌ Lead Creation Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route GET /api/leads
 * @desc Get all leads with filtering, sorting, pagination
 * @access Private
 */
router.get(
  "/",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor", "staff"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const {
        status,
        source,
        priority,
        assignedTo,
        search,
        followUpToday,
        overdueFollowUps,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 50,
      } = req.query;

      // Build query
      const query = { tenantId };

      if (status) query.status = status;
      if (source) query.source = source;
      if (priority) query.priority = priority;
      if (assignedTo) query.assignedTo = assignedTo;

      // Search by name, phone, or email
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Follow-up filters
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (followUpToday === "true") {
        query.nextFollowUpDate = { $gte: today, $lt: tomorrow };
      }

      if (overdueFollowUps === "true") {
        query.nextFollowUpDate = { $lt: today };
        query.status = { $nin: ["converted", "lost"] };
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [leads, total] = await Promise.all([
        Lead.find(query)
          .populate("assignedTo", "name email")
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Lead.countDocuments(query),
      ]);

      res.json({
        leads,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (err) {
      console.error("❌ Error fetching leads:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route GET /api/leads/:id
 * @desc Get a single lead by ID with call history
 * @access Private
 */
router.get(
  "/:id",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor", "staff"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { id } = req.params;

      const lead = await Lead.findOne({ _id: id, tenantId })
        .populate("assignedTo", "name email phone")
        .populate("assignedBy", "name email")
        .populate("studentId", "name email phone");

      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Get call history
      const callHistory = await CallLog.find({ tenantId, leadId: id })
        .populate("counsellorId", "name")
        .sort({ callDate: -1 })
        .limit(20);

      res.json({ lead, callHistory });
    } catch (err) {
      console.error("❌ Error fetching lead:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route PUT /api/leads/:id
 * @desc Update a lead
 * @access Private
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor", "staff"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { id } = req.params;

      const lead = await Lead.findOneAndUpdate(
        { _id: id, tenantId },
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate("assignedTo", "name email");

      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json({
        message: "Lead updated successfully ✅",
        lead,
      });
    } catch (err) {
      console.error("❌ Lead Update Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route DELETE /api/leads/:id
 * @desc Delete a lead
 * @access Private - tenantAdmin only
 */
router.delete(
  "/:id",
  protect,
  authorizeRoles("tenantAdmin", "manager"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { id } = req.params;

      const lead = await Lead.findOneAndDelete({ _id: id, tenantId });
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Also delete call logs
      await CallLog.deleteMany({ leadId: id, tenantId });

      res.json({ message: "Lead deleted successfully ✅" });
    } catch (err) {
      console.error("❌ Lead Delete Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// ============================================
// 📞 CALL LOGGING & FOLLOW-UP
// ============================================

/**
 * @route POST /api/leads/:id/log-call
 * @desc Log a call for a lead
 * @access Private
 */
router.post(
  "/:id/log-call",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor", "staff"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { id } = req.params;
      const {
        outcome,
        notes,
        callDuration,
        callType,
        newStatus,
        nextFollowUpDate,
        nextFollowUpNotes,
      } = req.body;

      if (!outcome) {
        return res.status(400).json({ message: "Call outcome is required" });
      }

      const lead = await Lead.findOne({ _id: id, tenantId });
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const previousStatus = lead.status;

      // Create call log
      const callLog = await CallLog.create({
        tenantId,
        leadId: id,
        counsellorId: req.user._id,
        counsellorName: req.user.name,
        outcome,
        notes,
        callDuration: callDuration || 0,
        callType: callType || "outbound",
        previousStatus,
        newStatus: newStatus || previousStatus,
        nextFollowUpDate,
        nextFollowUpNotes,
      });

      // Update lead
      const updateData = {
        lastCallDate: new Date(),
        lastCallOutcome: outcome,
        $inc: { totalCalls: 1 },
      };

      if (newStatus && newStatus !== previousStatus) {
        updateData.status = newStatus;
      }

      if (nextFollowUpDate) {
        updateData.nextFollowUpDate = nextFollowUpDate;
        updateData.followUpNotes = nextFollowUpNotes || "";
      }

      const updatedLead = await Lead.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate("assignedTo", "name email");

      res.json({
        message: "Call logged successfully ✅",
        callLog,
        lead: updatedLead,
      });
    } catch (err) {
      console.error("❌ Log Call Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route GET /api/leads/:id/call-history
 * @desc Get call history for a lead
 * @access Private
 */
router.get(
  "/:id/call-history",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor", "staff"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { id } = req.params;

      const callLogs = await CallLog.find({ tenantId, leadId: id })
        .populate("counsellorId", "name email")
        .sort({ callDate: -1 });

      res.json(callLogs);
    } catch (err) {
      console.error("❌ Error fetching call history:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// ============================================
// 👤 LEAD ASSIGNMENT
// ============================================

/**
 * @route PUT /api/leads/:id/assign
 * @desc Assign a lead to a counsellor
 * @access Private - tenantAdmin, manager
 */
router.put(
  "/:id/assign",
  protect,
  authorizeRoles("tenantAdmin", "manager"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { id } = req.params;
      const { assignedTo } = req.body;

      if (!assignedTo) {
        return res.status(400).json({ message: "assignedTo is required" });
      }

      const lead = await Lead.findOneAndUpdate(
        { _id: id, tenantId },
        {
          assignedTo,
          assignedAt: new Date(),
          assignedBy: req.user._id,
        },
        { new: true }
      ).populate("assignedTo", "name email");

      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json({
        message: "Lead assigned successfully ✅",
        lead,
      });
    } catch (err) {
      console.error("❌ Lead Assignment Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route PUT /api/leads/bulk-assign
 * @desc Bulk assign leads to a counsellor
 * @access Private - tenantAdmin, manager
 */
router.put(
  "/bulk-assign",
  protect,
  authorizeRoles("tenantAdmin", "manager"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { leadIds, assignedTo } = req.body;

      if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ message: "leadIds array is required" });
      }

      if (!assignedTo) {
        return res.status(400).json({ message: "assignedTo is required" });
      }

      const result = await Lead.updateMany(
        { _id: { $in: leadIds }, tenantId },
        {
          assignedTo,
          assignedAt: new Date(),
          assignedBy: req.user._id,
        }
      );

      res.json({
        message: `${result.modifiedCount} leads assigned successfully ✅`,
        modifiedCount: result.modifiedCount,
      });
    } catch (err) {
      console.error("❌ Bulk Assignment Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// ============================================
// 🔄 STATUS UPDATES
// ============================================

/**
 * @route PUT /api/leads/:id/status
 * @desc Update lead status
 * @access Private
 */
router.put(
  "/:id/status",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor", "staff"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { id } = req.params;
      const { status, lostReason } = req.body;

      if (!status) {
        return res.status(400).json({ message: "status is required" });
      }

      const updateData = { status };

      if (status === "lost" && lostReason) {
        updateData.lostReason = lostReason;
      }

      if (status === "converted") {
        updateData.conversionDate = new Date();
        updateData.convertedToStudent = true;
      }

      const lead = await Lead.findOneAndUpdate(
        { _id: id, tenantId },
        updateData,
        { new: true }
      ).populate("assignedTo", "name email");

      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json({
        message: "Lead status updated successfully ✅",
        lead,
      });
    } catch (err) {
      console.error("❌ Status Update Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route PUT /api/leads/bulk-status
 * @desc Bulk update lead status
 * @access Private
 */
router.put(
  "/bulk-status",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { leadIds, status, lostReason } = req.body;

      if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ message: "leadIds array is required" });
      }

      if (!status) {
        return res.status(400).json({ message: "status is required" });
      }

      const updateData = { status };

      if (status === "lost" && lostReason) {
        updateData.lostReason = lostReason;
      }

      if (status === "converted") {
        updateData.conversionDate = new Date();
        updateData.convertedToStudent = true;
      }

      const result = await Lead.updateMany(
        { _id: { $in: leadIds }, tenantId },
        updateData
      );

      res.json({
        message: `${result.modifiedCount} leads updated successfully ✅`,
        modifiedCount: result.modifiedCount,
      });
    } catch (err) {
      console.error("❌ Bulk Status Update Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// ============================================
// 🎯 CONVERSION
// ============================================

/**
 * @route POST /api/leads/:id/convert
 * @desc Convert a lead to a student
 * @access Private - tenantAdmin, manager
 */
router.post(
  "/:id/convert",
  protect,
  authorizeRoles("tenantAdmin", "manager", "counsellor"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { id } = req.params;
      const { studentId, actualFees } = req.body;

      const lead = await Lead.findOneAndUpdate(
        { _id: id, tenantId },
        {
          status: "converted",
          convertedToStudent: true,
          studentId,
          conversionDate: new Date(),
          actualFees,
        },
        { new: true }
      );

      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json({
        message: "Lead converted to student successfully ✅",
        lead,
      });
    } catch (err) {
      console.error("❌ Lead Conversion Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// ============================================
// 📈 REPORTS & ANALYTICS
// ============================================

/**
 * @route GET /api/leads/analytics/conversion-funnel
 * @desc Get conversion funnel analytics
 * @access Private
 */
router.get(
  "/analytics/conversion-funnel",
  protect,
  authorizeRoles("tenantAdmin", "manager"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { startDate, endDate } = req.query;

      const matchStage = { tenantId };
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const funnel = await Lead.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const funnelData = {
        new: 0,
        contacted: 0,
        interested: 0,
        "follow-up": 0,
        negotiation: 0,
        converted: 0,
        lost: 0,
      };

      funnel.forEach((item) => {
        if (item._id in funnelData) {
          funnelData[item._id] = item.count;
        }
      });

      // Calculate conversion rate
      const totalLeads = Object.values(funnelData).reduce((a, b) => a + b, 0);
      const conversionRate =
        totalLeads > 0
          ? ((funnelData.converted / totalLeads) * 100).toFixed(2)
          : 0;

      res.json({
        funnel: funnelData,
        totalLeads,
        conversionRate: parseFloat(conversionRate),
      });
    } catch (err) {
      console.error("❌ Funnel Analytics Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route GET /api/leads/analytics/source-performance
 * @desc Get lead source performance analytics
 * @access Private
 */
router.get(
  "/analytics/source-performance",
  protect,
  authorizeRoles("tenantAdmin", "manager"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;

      const sourcePerformance = await Lead.aggregate([
        { $match: { tenantId } },
        {
          $group: {
            _id: "$source",
            total: { $sum: 1 },
            converted: {
              $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
            },
            lost: {
              $sum: { $cond: [{ $eq: ["$status", "lost"] }, 1, 0] },
            },
            inProgress: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["new", "contacted", "interested", "follow-up", "negotiation"]] },
                  1,
                  0,
                ],
              },
            },
            totalExpectedFees: { $sum: "$expectedFees" },
            totalActualFees: { $sum: "$actualFees" },
          },
        },
        {
          $project: {
            source: "$_id",
            total: 1,
            converted: 1,
            lost: 1,
            inProgress: 1,
            conversionRate: {
              $cond: [
                { $gt: ["$total", 0] },
                { $multiply: [{ $divide: ["$converted", "$total"] }, 100] },
                0,
              ],
            },
            totalExpectedFees: 1,
            totalActualFees: 1,
          },
        },
        { $sort: { total: -1 } },
      ]);

      res.json(sourcePerformance);
    } catch (err) {
      console.error("❌ Source Performance Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route GET /api/leads/analytics/counsellor-performance
 * @desc Get counsellor performance analytics
 * @access Private - tenantAdmin, manager
 */
router.get(
  "/analytics/counsellor-performance",
  protect,
  authorizeRoles("tenantAdmin", "manager"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;

      const counsellorPerformance = await Lead.aggregate([
        { $match: { tenantId, assignedTo: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: "$assignedTo",
            totalLeads: { $sum: 1 },
            converted: {
              $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
            },
            lost: {
              $sum: { $cond: [{ $eq: ["$status", "lost"] }, 1, 0] },
            },
            inProgress: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["new", "contacted", "interested", "follow-up", "negotiation"]] },
                  1,
                  0,
                ],
              },
            },
            totalCalls: { $sum: "$totalCalls" },
            totalRevenue: { $sum: "$actualFees" },
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "_id",
            foreignField: "_id",
            as: "counsellor",
          },
        },
        { $unwind: { path: "$counsellor", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            counsellorId: "$_id",
            counsellorName: "$counsellor.name",
            counsellorEmail: "$counsellor.email",
            totalLeads: 1,
            converted: 1,
            lost: 1,
            inProgress: 1,
            totalCalls: 1,
            totalRevenue: 1,
            conversionRate: {
              $cond: [
                { $gt: ["$totalLeads", 0] },
                { $multiply: [{ $divide: ["$converted", "$totalLeads"] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { converted: -1 } },
      ]);

      res.json(counsellorPerformance);
    } catch (err) {
      console.error("❌ Counsellor Performance Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

export default router;
