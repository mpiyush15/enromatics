import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { tenantProtect } from "../middleware/tenantProtect.js";
import {
  getKPIs,
  getTodayRevenue,
  getMonthlyRevenue,
  getAdmissionSummary,
  getLeadSources,
  getTopStudents,
  getFacultyPerformance,
  getUpcomingTests
} from "../controllers/instituteOverviewController.js";

const router = express.Router();

/**
 * 📊 INSTITUTE OVERVIEW ROUTES
 * All routes require tenantId middleware authentication
 * Base: /api/institute/
 */

/**
 * GET /api/institute/kpis
 * Returns: totalStudents, activeBatches, attendanceTodayPercentage, pendingFeesAmount
 * Response Time: ~500ms (4 database queries, cached)
 */
router.get("/kpis", protect, tenantProtect, getKPIs);

/**
 * GET /api/institute/revenue/today
 * Returns: collectionsToday, feeRecoveryRate %, pendingFeesTotal
 * Response Time: ~400ms (2 aggregation queries)
 */
router.get("/revenue/today", protect, tenantProtect, getTodayRevenue);

/**
 * GET /api/institute/revenue/monthly
 * Query Params: ?months=6 (default)
 * Returns: Array of {month, revenue} for line chart
 * Response Time: ~600ms (1 aggregation query, 6 months data)
 */
router.get("/revenue/monthly", protect, tenantProtect, getMonthlyRevenue);

/**
 * GET /api/institute/admissions/summary
 * Returns: activeLeads, newAdmissionsThisMonth, costPerAdmit
 * Response Time: ~450ms (3 queries + aggregation)
 */
router.get("/admissions/summary", protect, tenantProtect, getAdmissionSummary);

/**
 * GET /api/institute/leads/sources
 * Returns: Array of {name, value, fill} for pie chart
 * Response Time: ~350ms (1 aggregation query, grouped by source)
 */
router.get("/leads/sources", protect, tenantProtect, getLeadSources);

/**
 * GET /api/institute/students/top-performers
 * Query Params: ?limit=4 (default)
 * Returns: Array of top students with rank, score, batch
 * Response Time: ~400ms (1 aggregation + projection)
 */
router.get("/students/top-performers", protect, tenantProtect, getTopStudents);

/**
 * GET /api/institute/faculty/performance
 * Returns: Array of faculty with avgScore, completionRate, studentRating
 * Response Time: ~300ms (1 find query + mock analytics)
 */
router.get("/faculty/performance", protect, tenantProtect, getFacultyPerformance);

/**
 * GET /api/institute/tests/upcoming
 * Query Params: ?days=30 (default)
 * Returns: Array of upcoming tests in next N days
 * Response Time: ~350ms (1 find query with sort/limit)
 */
router.get("/tests/upcoming", protect, tenantProtect, getUpcomingTests);

export default router;
