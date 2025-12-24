import express from "express";
import { getInstituteOverview, getRevenueData } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/dashboard/overview
 * @desc    Fetch institute overview stats
 * @access  Private (tenantAdmin, superadmin)
 */
router.get("/overview", protect, authorizeRoles("tenantAdmin", "SuperAdmin"), getInstituteOverview);

/**
 * @route   GET /api/dashboard/revenue
 * @desc    Fetch revenue data (quarterly/annual)
 * @access  Private (tenantAdmin, superadmin)
 */
router.get("/revenue", protect, authorizeRoles("tenantAdmin", "SuperAdmin"), getRevenueData);

export default router;
