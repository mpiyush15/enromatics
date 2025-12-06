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
router.get("/dashboard", protect, authorizeRoles("SuperAdmin"), getDashboardAnalytics);

// Get revenue breakdown by billing cycle - SuperAdmin only
router.get("/revenue-breakdown", protect, authorizeRoles("SuperAdmin"), getRevenueBreakdown);

// Get top tenants by revenue - SuperAdmin only
router.get("/top-tenants", protect, authorizeRoles("SuperAdmin"), getTopTenants);

export default router;
