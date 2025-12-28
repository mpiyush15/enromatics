/**
 * SuperCRM Routes - Sales Management for SuperAdmin
 * Enro Matics © 2025
 */

import express from "express";
import Lead from "../models/Lead.js";
import DemoRequest from "../models/DemoRequest.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/supercrm/stats
 * @desc    Get SuperCRM dashboard stats
 * @access  Private – SuperAdmin only
 */
router.get(
  "/stats",
  protect,
  authorizeRoles("SuperAdmin"),
  async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);

      // Form Leads stats (leads without tenantId or with public sources)
      const formLeadsQuery = {
        $or: [
          { tenantId: { $exists: false } },
          { tenantId: null },
          { tenantId: "" },
          { source: "public-form" },
          { source: "landing-page" },
          { source: "lead-form" },
          { source: "website-form" },
        ]
      };

      const [
        totalFormLeads,
        newFormLeads,
        contactedFormLeads,
        convertedFormLeads,
        formLeadSources,
        thisWeekFormLeads,
      ] = await Promise.all([
        Lead.countDocuments(formLeadsQuery),
        Lead.countDocuments({ ...formLeadsQuery, status: "new" }),
        Lead.countDocuments({ ...formLeadsQuery, status: "contacted" }),
        Lead.countDocuments({ ...formLeadsQuery, status: "converted" }),
        Lead.aggregate([
          { $match: formLeadsQuery },
          { $group: { _id: "$source", count: { $sum: 1 } } },
        ]),
        Lead.countDocuments({ ...formLeadsQuery, createdAt: { $gte: weekStart } }),
      ]);

      // Demo Requests stats
      const [
        totalDemos,
        pendingDemos,
        confirmedDemos,
        completedDemos,
        thisWeekDemos,
      ] = await Promise.all([
        DemoRequest.countDocuments({}),
        DemoRequest.countDocuments({ status: "pending" }),
        DemoRequest.countDocuments({ status: "confirmed" }),
        DemoRequest.countDocuments({ status: "completed" }),
        DemoRequest.countDocuments({ createdAt: { $gte: weekStart } }),
      ]);

      // Build sources object
      const sources = {};
      formLeadSources.forEach((item) => {
        const sourceName = item._id || "unknown";
        sources[sourceName] = item.count;
      });

      res.json({
        formLeads: {
          total: totalFormLeads,
          new: newFormLeads,
          contacted: contactedFormLeads,
          converted: convertedFormLeads,
        },
        demoRequests: {
          total: totalDemos,
          pending: pendingDemos,
          confirmed: confirmedDemos,
          completed: completedDemos,
        },
        thisWeek: {
          newLeads: thisWeekFormLeads,
          conversions: convertedFormLeads,
          demos: thisWeekDemos,
        },
        sources,
      });
    } catch (err) {
      console.error("❌ SuperCRM stats error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @route   GET /api/supercrm/all-leads
 * @desc    Get all leads (form leads + demo requests combined)
 * @access  Private – SuperAdmin only
 */
router.get(
  "/all-leads",
  protect,
  authorizeRoles("SuperAdmin"),
  async (req, res) => {
    try {
      const { page = 1, limit = 50, type, status } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const results = [];

      // Get form leads
      if (!type || type === "form") {
        const formLeadsQuery = {
          $or: [
            { tenantId: { $exists: false } },
            { tenantId: null },
            { tenantId: "" },
            { source: "public-form" },
            { source: "landing-page" },
          ]
        };
        
        if (status) formLeadsQuery.status = status;

        const formLeads = await Lead.find(formLeadsQuery)
          .sort({ createdAt: -1 })
          .lean();

        formLeads.forEach((lead) => {
          results.push({
            ...lead,
            type: "form",
          });
        });
      }

      // Get demo requests
      if (!type || type === "demo") {
        const demoQuery = {};
        if (status) demoQuery.status = status;

        const demoRequests = await DemoRequest.find(demoQuery)
          .sort({ createdAt: -1 })
          .lean();

        demoRequests.forEach((demo) => {
          results.push({
            ...demo,
            type: "demo",
          });
        });
      }

      // Sort combined results
      results.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Paginate
      const paginatedResults = results.slice(skip, skip + parseInt(limit));
      const total = results.length;

      res.json({
        leads: paginatedResults,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (err) {
      console.error("❌ SuperCRM all-leads error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
