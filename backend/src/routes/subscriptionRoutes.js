import express from 'express';
import { getSubscription, upgradeToPremium, requestMobileApp, getPremiumSubscriptions } from '../controllers/subscriptionController.js';
import { protect as authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get subscription details for current tenant
router.get('/:tenantId', authMiddleware, getSubscription);

// Upgrade to premium subscription
router.post('/:tenantId/upgrade', authMiddleware, upgradeToPremium);

// Request mobile app generation (premium only)
router.post('/:tenantId/mobile-app', authMiddleware, requestMobileApp);

// Admin: Get all premium subscriptions
router.get('/admin/premium', authMiddleware, getPremiumSubscriptions);

export default router;