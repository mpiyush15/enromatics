import express from 'express';
import SubscriptionPayment from '../models/SubscriptionPayment.js';
import Tenant from '../models/Tenant.js';
import { sendEmail } from '../services/emailService.js';
import { generateSubscriptionExpiryEmail } from '../services/subscriptionNotificationService.js';
import { PLANS } from '../config/plans.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

console.log('✅ subscriptionNotificationRoutes.js loaded - registering routes');

/**
 * GET /api/subscription-notifications/expiring-soon
 * Get all subscriptions expiring within specified days (Superadmin only)
 */
router.get('/expiring-soon', protect, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const { daysUntilExpiry = 30, type = 'all' } = req.query;
    const daysNum = parseInt(daysUntilExpiry);

    // Calculate date range
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysNum);

    // Build query
    let query = {
      expiryDate: {
        $gte: today,
        $lte: futureDate
      }
    };

    if (type === 'trial') {
      query.type = 'trial';
    } else if (type === 'subscription') {
      query.type = 'subscription';
    }

    // Fetch subscriptions
    const subscriptions = await SubscriptionPayment.find(query)
      .populate('tenantId', 'name email contactEmail subscriptionStatus')
      .sort({ expiryDate: 1 });

    // Enrich with calculated fields
    const enriched = subscriptions.map(sub => {
      const now = new Date();
      const daysRemaining = Math.ceil((new Date(sub.expiryDate) - now) / (1000 * 60 * 60 * 24));
      const planInfo = PLANS.find(p => p.id === sub.planId);

      return {
        id: sub._id,
        tenantId: sub.tenantId?._id,
        tenantName: sub.tenantId?.name,
        email: sub.tenantId?.email || sub.tenantId?.contactEmail,
        currentPlan: {
          id: sub.planId,
          name: planInfo?.name || sub.planId,
          price: planInfo?.priceMonthly || 0,
          features: planInfo?.features || []
        },
        expiryDate: sub.expiryDate,
        daysRemaining,
        type: sub.type,
        status: sub.status,
        notificationSent: sub.notificationSent || false
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    console.error('❌ Error fetching expiring subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring subscriptions',
      error: error.message
    });
  }
});

/**
 * POST /api/subscription-notifications/send-expiry-notification
 * Send expiry notification email to a specific tenant (Superadmin only)
 */
console.log('🔴 Registering POST /send-expiry-notification route');
router.post('/send-expiry-notification', protect, authorizeRoles('superadmin'), async (req, res) => {
  console.log('📮 POST /send-expiry-notification called');
  try {
    console.log('📋 Request body:', req.body);
    const { tenantId, customMessage } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'tenantId is required'
      });
    }

    // Fetch tenant
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Fetch active subscription
    const subscription = await SubscriptionPayment.findOne({
      tenantId,
      status: { $in: ['active', 'trial'] }
    }).sort({ expiryDate: -1 });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for this tenant'
      });
    }

    // Calculate days remaining
    const now = new Date();
    const daysRemaining = Math.ceil((new Date(subscription.expiryDate) - now) / (1000 * 60 * 60 * 24));

    // Get plan info
    const planInfo = PLANS.find(p => p.id === subscription.planId);
    const currentPlan = {
      id: subscription.planId,
      name: planInfo?.name || subscription.planId,
      price: planInfo?.priceMonthly || 0,
      features: planInfo?.features || []
    };

    // Build dashboard link
    const frontendUrl = process.env.FRONTEND_URL || 'https://dashboard.pixelsdigital.tech';
    const dashboardLink = `${frontendUrl}/dashboard/client/${tenantId}/my-subscription`;

    // Generate email HTML
    const emailHtml = generateSubscriptionExpiryEmail({
      tenantName: tenant.name,
      currentPlan,
      expiryDate: subscription.expiryDate,
      daysRemaining,
      subscriptionType: subscription.type,
      dashboardLink
    });

    // Send email
    const emailSubject = subscription.type === 'trial'
      ? `⏰ Your Free Trial Expires in ${daysRemaining} Days`
      : `📅 Your Subscription Renewal is Due in ${daysRemaining} Days`;

    await sendEmail({
      to: tenant.email || tenant.contactEmail,
      subject: emailSubject,
      html: emailHtml,
      replyTo: 'support@pixelsdigital.tech'
    });

    // Mark notification as sent
    subscription.notificationSent = true;
    subscription.notificationSentAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: `✅ Expiry notification sent to ${tenant.name}`,
      data: {
        tenant: {
          id: tenant._id,
          name: tenant.name,
          email: tenant.email || tenant.contactEmail
        },
        subscription: {
          planId: subscription.planId,
          expiryDate: subscription.expiryDate,
          daysRemaining,
          type: subscription.type
        },
        emailSent: true,
        sentAt: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Error sending expiry notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

/**
 * GET /api/subscription-notifications/status/:tenantId
 * Get subscription status for a specific tenant (for topbar notifications)
 */
router.get('/status/:tenantId', protect, async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Verify tenant access (user owns this tenant)
    if (req.user?.tenantId?.toString() !== tenantId && req.user?.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Fetch active subscription
    const subscription = await SubscriptionPayment.findOne({
      tenantId,
      status: { $in: ['active', 'trial'] }
    }).sort({ expiryDate: -1 });

    if (!subscription) {
      return res.json({
        success: true,
        data: null,
        message: 'No active subscription'
      });
    }

    // Calculate days remaining
    const now = new Date();
    const daysRemaining = Math.ceil((new Date(subscription.expiryDate) - now) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      data: {
        subscriptionId: subscription._id,
        planId: subscription.planId,
        type: subscription.type,
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        daysRemaining,
        requiresNotification: daysRemaining <= 30,
        notificationLevel: daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'high' : daysRemaining <= 30 ? 'medium' : 'low'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription status',
      error: error.message
    });
  }
});

export default router;
