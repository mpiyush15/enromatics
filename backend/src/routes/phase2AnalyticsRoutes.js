/**
 * Phase 2 Analytics Routes
 * Conversion goals & funnel tracking
 * 
 * Enro Matics © 2025
 */

import express from "express";
import {
  createGoal,
  getGoals,
  trackGoal,
  getGoalAnalytics,
  createFunnel,
  getFunnels,
  getFunnelAnalytics,
  trackFunnelStep
} from "../controllers/phase2AnalyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==================== GOALS ROUTES ====================

/**
 * @route   POST /api/analytics/phase2/goals
 * @desc    Create a new conversion goal
 * @access  Private – SuperAdmin only
 */
router.post(
  "/goals",
  protect,
  authorizeRoles("SuperAdmin"),
  createGoal
);

/**
 * @route   GET /api/analytics/phase2/goals
 * @desc    Get all conversion goals
 * @access  Private – SuperAdmin only
 */
router.get(
  "/goals",
  protect,
  authorizeRoles("SuperAdmin"),
  getGoals
);

/**
 * @route   POST /api/analytics/phase2/track-goal
 * @desc    Track a goal conversion (called from frontend)
 * @body    { goalId, sessionId, conversionValue?, revenue? }
 * @access  Public – called by frontend tracking
 */
router.post(
  "/track-goal",
  trackGoal
);

/**
 * @route   GET /api/analytics/phase2/goals/:id/analytics
 * @desc    Get conversion analytics for a goal
 * @query   timeRange: 'today' | 'week' | 'month'
 * @access  Private – SuperAdmin only
 */
router.get(
  "/goals/:id/analytics",
  protect,
  authorizeRoles("SuperAdmin"),
  getGoalAnalytics
);

// ==================== FUNNEL ROUTES ====================

/**
 * @route   POST /api/analytics/phase2/funnels
 * @desc    Create a new conversion funnel
 * @body    { name, description, steps: [...] }
 * @access  Private – SuperAdmin only
 */
router.post(
  "/funnels",
  protect,
  authorizeRoles("SuperAdmin"),
  createFunnel
);

/**
 * @route   GET /api/analytics/phase2/funnels
 * @desc    Get all conversion funnels
 * @access  Private – SuperAdmin only
 */
router.get(
  "/funnels",
  protect,
  authorizeRoles("SuperAdmin"),
  getFunnels
);

/**
 * @route   GET /api/analytics/phase2/funnels/:id
 * @desc    Get single funnel with conversion metrics
 * @query   timeRange: 'today' | 'week' | 'month'
 * @access  Private – SuperAdmin only
 */
router.get(
  "/funnels/:id",
  protect,
  authorizeRoles("SuperAdmin"),
  getFunnelAnalytics
);

/**
 * @route   POST /api/analytics/phase2/funnels/:id/track-step
 * @desc    Track a funnel step completion
 * @body    { stepNumber, sessionId, timeOnStep? }
 * @access  Public – called by frontend tracking
 */
router.post(
  "/funnels/:id/track-step",
  trackFunnelStep
);

export default router;
