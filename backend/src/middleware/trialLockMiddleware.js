import Tenant from '../models/Tenant.js';

/**
 * Trial lock middleware: enforce 14-day trial window
 * If trial expired and no active subscription, block access
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

    // Trial expired and no active subscription
    console.log(`Trial lock triggered for tenant: ${tenantId}`);
    return res.status(402).json({
      success: false,
      code: 'trial_expired',
      message: 'Your trial has expired. Please upgrade to continue.',
      upgradeUrl: `${process.env.FRONTEND_URL}/pricing`,
    });
  } catch (err) {
    console.error('Trial lock middleware error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
