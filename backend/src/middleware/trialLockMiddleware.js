import Tenant from '../models/Tenant.js';

/**
 * Trial lock middleware: enforce 14-day trial window
 * If trial expired and no active subscription, block access to features
 * BUT allow: subscription/upgrade routes, tenant settings, pricing
 */
export const trialLock = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'Tenant ID missing' });

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Check if subscription is active
    if (tenant.subscription?.status === 'active' && tenant.subscription?.endDate > new Date()) {
      return next(); // Subscription active, allow access
    }

    // Check trial window (14 days from createdAt)
    const trialDays = 14;
    const trialEnd = new Date(tenant.createdAt);
    trialEnd.setDate(trialEnd.getDate() + trialDays);

    if (new Date() <= trialEnd) {
      return next(); // Trial still active
    }

    // Trial expired - check if this is an ALLOWED route
    const allowedRoutes = [
      '/api/tenants/', // Tenant settings/profile
      '/api/subscription', // Subscription pages
      '/api/payment', // Payment/upgrade
      '/api/pricing', // Pricing info
    ];

    const isAllowedRoute = allowedRoutes.some(route => req.path.includes(route));

    if (isAllowedRoute) {
      return next(); // Allow access to settings/upgrade routes
    }

    // Trial expired and trying to access blocked feature
    console.log(`Trial lock triggered for tenant: ${tenantId} on route: ${req.path}`);
    return res.status(402).json({
      success: false,
      code: 'trial_expired',
      message: 'Your trial has expired. Please upgrade to continue using this feature.',
      upgradeUrl: `${process.env.FRONTEND_URL}/pricing`,
    });
  } catch (err) {
    console.error('Trial lock middleware error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
