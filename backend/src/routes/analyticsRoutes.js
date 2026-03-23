import express from "express";
import { 
  getDashboardAnalytics,
  getRevenueBreakdown,
  getTopTenants
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ============== SUPERADMIN ANALYTICS ==============
// Get comprehensive dashboard analytics - SuperAdmin only
router.get("/dashboard", protect, authorizeRoles("superadmin"), getDashboardAnalytics);

// Get revenue breakdown by billing cycle - superadmin only
router.get("/revenue-breakdown", protect, authorizeRoles("superadmin"), getRevenueBreakdown);

// Get top tenants by revenue - superadmin only
router.get("/top-tenants", protect, authorizeRoles("superadmin"), getTopTenants);

export default router;
