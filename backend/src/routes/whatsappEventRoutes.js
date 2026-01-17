/**
 * WhatsApp Event Routes
 * Simple routes for managing WhatsApp event triggers
 */

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Tenant from "../models/Tenant.js";
import WhatsAppEventLog from "../models/WhatsAppEventLog.js";
import whatsappEventService from "../services/whatsappEventService.js";
import Student from "../models/Student.js";

const router = express.Router();

/**
 * GET /api/whatsapp/events/settings
 * Get event trigger settings for tenant
 */
router.get("/events/settings", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const tenant = await Tenant.findOne({ tenantId }).select("eventTriggers");
    console.log("🔍 [GET SETTINGS] Tenant eventTriggers from DB:", tenant?.eventTriggers);

    res.status(200).json({
      success: true,
      eventTriggers: tenant?.eventTriggers || {},
    });
  } catch (error) {
    console.error("Error fetching event settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/whatsapp/events/settings
 * Update event trigger settings
 */
router.put("/events/settings", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { eventType, enabled, template } = req.body;
    console.log("🔍 [PUT SETTINGS] Request received:", { tenantId, eventType, enabled, template });

    if (!eventType) {
      return res.status(400).json({ message: "eventType is required" });
    }

    // Update specific event trigger
    const updateData = {};
    updateData[`eventTriggers.${eventType}`] = {
      enabled: enabled ?? false,
      template: template || "",
    };
    console.log("🔍 [PUT SETTINGS] Update data:", updateData);

    const tenant = await Tenant.findOneAndUpdate({ tenantId }, updateData, {
      new: true,
    }).select("eventTriggers");
    console.log("🔍 [PUT SETTINGS] Updated tenant eventTriggers:", tenant?.eventTriggers);

    res.status(200).json({
      success: true,
      message: "Event settings updated",
      eventTriggers: tenant.eventTriggers,
    });
  } catch (error) {
    console.error("Error updating event settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/whatsapp/events/test
 * Send test absence message
 */
router.post("/events/test", protect, async (req, res) => {
  try {
    console.log("🔍 [TEST MESSAGE] Route hit");
    const tenantId = req.user?.tenantId;
    console.log("🔍 [TEST MESSAGE] tenantId from auth:", tenantId);
    
    if (!tenantId) {
      console.log("🔍 [TEST MESSAGE] ERROR: No tenantId from auth");
      return res.status(403).json({ message: "Tenant ID missing" });
    }

    const { studentId } = req.body;
    console.log("🔍 [TEST MESSAGE] studentId from body:", studentId);

    if (!studentId) {
      console.log("🔍 [TEST MESSAGE] ERROR: No studentId in body");
      return res.status(400).json({ message: "studentId is required" });
    }

    // Get student
    const student = await Student.findById(studentId);
    console.log("🔍 [TEST MESSAGE] Student found:", student?.name, student?.phone);
    
    if (!student) {
      console.log("🔍 [TEST MESSAGE] ERROR: Student not found");
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.phone) {
      console.log("🔍 [TEST MESSAGE] ERROR: Student has no phone");
      return res.status(400).json({ message: "Student has no phone number" });
    }

    // Send test message
    console.log("🔍 [TEST MESSAGE] Calling whatsappEventService.sendAbsenceNotification...");
    const result = await whatsappEventService.sendAbsenceNotification(
      tenantId,
      studentId,
      { date: new Date(), remarks: "Test message" }
    );
    console.log("🔍 [TEST MESSAGE] Service result:", result);

    res.status(200).json({
      success: result.success,
      message: result.success
        ? "Test message queued for sending"
        : result.reason || "Test message failed",
      logId: result.logId,
      reason: result.reason,
    });
  } catch (error) {
    console.error("❌ [TEST MESSAGE] Error sending test message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/whatsapp/events/logs
 * Get WhatsApp message logs
 */
router.get("/events/logs", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { eventType, limit = 50, page = 1 } = req.query;

    const query = { tenantId };
    if (eventType) query.eventType = eventType;

    const logs = await WhatsAppEventLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await WhatsAppEventLog.countDocuments(query);

    res.status(200).json({
      success: true,
      logs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/whatsapp/events/logs/:logId
 * Delete a log entry (for testing)
 */
router.delete("/events/logs/:logId", protect, async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { logId } = req.params;

    const log = await WhatsAppEventLog.findOneAndDelete({
      _id: logId,
      tenantId,
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.status(200).json({
      success: true,
      message: "Log deleted",
    });
  } catch (error) {
    console.error("Error deleting log:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
