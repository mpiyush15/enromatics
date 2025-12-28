/**
 * Phase 1 Analytics Routes
 * Advanced engagement metrics: bounce rate, session duration, etc
 * 
 * Enro Matics © 2025
 */

import express from "express";
import {
  getBounceRate,
  getSessionDuration,
  getUserTypes,
  getTimeOnPage,
  getEntryExitPages,
  trackInteraction
} from "../controllers/phase1AnalyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/analytics/phase1/bounce-rate
 * @desc    Get bounce rate statistics
 * @query   timeRange: 'today' | 'week' | 'month'
 * @access  Private – SuperAdmin only
 */
router.get(
  "/bounce-rate",
  protect,
  authorizeRoles("SuperAdmin"),
  getBounceRate
);

/**
 * @route   GET /api/analytics/phase1/session-duration
 * @desc    Get session duration statistics
 * @query   timeRange: 'today' | 'week' | 'month'
 * @access  Private – SuperAdmin only
 */
router.get(
  "/session-duration",
  protect,
  authorizeRoles("SuperAdmin"),
  getSessionDuration
);

/**
 * @route   GET /api/analytics/phase1/user-types
 * @desc    Get new vs returning user breakdown
 * @query   timeRange: 'today' | 'week' | 'month'
 * @access  Private – SuperAdmin only
 */
router.get(
  "/user-types",
  protect,
  authorizeRoles("SuperAdmin"),
  getUserTypes
);

/**
 * @route   GET /api/analytics/phase1/time-on-page
 * @desc    Get time spent on each page
 * @query   timeRange: 'today' | 'week' | 'month'
 * @query   limit: number of top pages
 * @access  Private – SuperAdmin only
 */
router.get(
  "/time-on-page",
  protect,
  authorizeRoles("SuperAdmin"),
  getTimeOnPage
);

/**
 * @route   GET /api/analytics/phase1/entry-exit
 * @desc    Get entry and exit pages (funnel points)
 * @query   timeRange: 'today' | 'week' | 'month'
 * @query   limit: number of top pages
 * @access  Private – SuperAdmin only
 */
router.get(
  "/entry-exit",
  protect,
  authorizeRoles("SuperAdmin"),
  getEntryExitPages
);

/**
 * @route   POST /api/analytics/phase1/track-interaction
 * @desc    Track user interaction (click, scroll, form input)
 * @body    { sessionId, page, type, element, scrollDepth }
 * @access  Public – called by frontend tracking script
 */
router.post(
  "/track-interaction",
  trackInteraction
);

export default router;
