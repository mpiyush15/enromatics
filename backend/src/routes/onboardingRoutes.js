// Onboarding wizard routes

import express from 'express';
import {
  getOnboardingStatus,
  updateBranding,
  createInitialClasses,
  completeOnboarding,
} from '../controllers/onboardingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * GET /api/onboarding/status
 * Check onboarding progress
 */
router.get('/status', protect, getOnboardingStatus);

/**
 * PUT /api/onboarding/branding
 * Update logo, theme color, app name
 */
router.put('/branding', protect, authorizeRoles('tenantAdmin'), updateBranding);

/**
 * POST /api/onboarding/classes
 * Create initial classes/batches
 */
router.post('/classes', protect, authorizeRoles('tenantAdmin'), createInitialClasses);

/**
 * POST /api/onboarding/complete
 * Finalize onboarding and redirect to dashboard
 */
router.post('/complete', protect, authorizeRoles('tenantAdmin'), completeOnboarding);

export default router;
