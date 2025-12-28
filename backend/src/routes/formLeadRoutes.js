/**
 * Form Leads Routes - Public form submissions for SuperAdmin
 * Enro Matics © 2025
 */

import express from "express";
import Lead from "../models/Lead.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/form-leads
 * @desc    Get all public form leads (without tenantId or with source=public-form)
 * @access  Private – SuperAdmin only
 */
router.get(
  "/",
  protect,
  authorizeRoles("SuperAdmin"),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status } = req.query;

      const query = {
        $or: [
          { tenantId: { $exists: false } },
          { tenantId: null },
          { tenantId: "" },
          { source: "public-form" },
          { source: "lead-form" },
          { source: "website-form" },
        ]
      };

      if (status) {
        query.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [leads, total] = await Promise.all([
        Lead.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Lead.countDocuments(query),
      ]);

      res.json({
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (err) {
      console.error("❌ Form leads fetch error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @route   POST /api/form-leads
 * @desc    Submit a public lead from website form (no auth required)
 * @access  Public
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, mobile, institute, plan, message, notes, source } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const leadPhone = phone || mobile;

    const lead = await Lead.create({
      name,
      email,
      phone: leadPhone,
      institute,
      plan,
      notes: notes || message,
      source: source || "public-form",  // Use source from request, fallback to public-form
      status: "new",
    });

    console.log(`✅ Form lead created: ${name} - ${leadPhone} - Source: ${source || "public-form"}`);

    res.status(201).json({
      success: true,
      message: "Lead submitted successfully",
      lead,
    });
  } catch (err) {
    console.error("❌ Public form lead error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   PUT /api/form-leads/:id/status
 * @desc    Update form lead status
 * @access  Private – SuperAdmin only
 */
router.put(
  "/:id/status",
  protect,
  authorizeRoles("SuperAdmin"),
  async (req, res) => {
    try {
      const { status } = req.body;

      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json({ success: true, lead });
    } catch (err) {
      console.error("❌ Update lead status error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
