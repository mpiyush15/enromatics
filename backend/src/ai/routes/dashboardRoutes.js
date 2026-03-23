/**
 * AI Dashboard Routes
 * Central AI endpoint router
 * ✅ Multi-tenant ready - tenantProtect ensures tenant isolation
 */

import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { tenantProtect } from "../../middleware/tenantProtect.js";
import { authorizeRoles } from "../../middleware/roleMiddleware.js";
import { getDashboardInsights } from "../controllers/dashboardController.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "🧠 AI Dashboard router is loaded!" });
});

// Main dashboard insights endpoint
router.get(
  "/dashboard/insights",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  tenantProtect,
  getDashboardInsights
);

export default router;
