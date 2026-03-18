import express from "express";
import { getInstituteOverview, getRevenueData, getMonthlyFeesCollection } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/dashboard/overview
 * @desc    Fetch institute overview stats
 * @access  Private (tenantAdmin, superadmin)
 */
router.get("/overview", protect, authorizeRoles("tenantadmin", "superadmin"), getInstituteOverview);

/**
 * @route   GET /api/dashboard/monthly-fees
 * @desc    Fetch monthly fees collection data
 * @access  Private (tenantAdmin, superadmin)
 */
router.get("/monthly-fees", protect, authorizeRoles("tenantadmin", "superadmin"), getMonthlyFeesCollection);

/**
 * @route   GET /api/dashboard/revenue
 * @desc    Fetch revenue data (quarterly/annual)
 * @access  Private (tenantAdmin, superadmin)
 */
router.get("/revenue", protect, authorizeRoles("tenantadmin", "superadmin"), getRevenueData);

export default router;
