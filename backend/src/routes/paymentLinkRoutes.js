import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  generatePaymentLink,
  sendPaymentLinkEmail,
  getAllPlans,
  getPaymentSessionDetails,
  getTenantPaymentSessions,
  initiatePaymentLinkPayment,
  handlePaymentLinkWebhook
} from '../controllers/paymentLinkController.js';

const router = express.Router();

/**
 * SuperAdmin generates payment link for tenant
 */
router.post('/generate', protect, generatePaymentLink);

/**
 * Send payment link via email
 */
router.post('/send-email', protect, sendPaymentLinkEmail);

/**
 * Initiate Cashfree payment for a payment link (public - via sessionId)
 */
router.post('/initiate', initiatePaymentLinkPayment);

/**
 * Get all available plans (public - no auth needed)
 */
router.get('/plans', getAllPlans);

/**
 * Get payment session details (public - no auth needed)
 */
router.get('/session/:sessionId', getPaymentSessionDetails);

/**
 * Webhook for payment link payments (public - called after payment confirmation)
 */
router.post('/webhook', handlePaymentLinkWebhook);

/**
 * Get all payment sessions for a tenant
 */
router.get('/tenant/:tenantId', protect, getTenantPaymentSessions);

export default router;
