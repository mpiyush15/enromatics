import Tenant from '../models/Tenant.js';

/**
 * Trial lock middleware: enforce 14-day trial window
 * If trial expired and no active subscription, block access to features
 * BUT allow: subscription/upgrade routes, tenant settings, pricing
 */
export const trialLock = async (req, res, next) => {
  // ⚠️ TEMPORARILY DISABLED FOR TESTING
  // Smart trial lock logic is preserved below - will re-enable after stabilizing other fixes
  return next();

  /* SMART TRIAL LOCK LOGIC - DISABLED FOR NOW
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'Tenant ID missing' });

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // ============= PAID USERS - ALWAYS ALLOW =============
    const paidPlans = ['professional', 'pro', 'enterprise', 'basic', 'starter'];
    const isPaidPlan = paidPlans.includes(tenant.plan);

    const hasActiveSubscription = 
      tenant.subscription?.status === 'active' && 
      tenant.subscription?.endDate && 
      new Date(tenant.subscription.endDate) > new Date();

    if (isPaidPlan || hasActiveSubscription) {
      console.log(`✅ [TRIAL LOCK] Paid/Active user allowed: ${tenantId} (plan: ${tenant.plan})`);
      return next();
    }

    // ============= FREE TRIAL USERS - CHECK EXPIRY =============
    const isFreeTrial = tenant.plan === 'free' || tenant.plan === 'trial';
    
    if (!isFreeTrial) {
      console.log(`⚠️  [TRIAL LOCK] Unknown plan allowed: ${tenantId} (plan: ${tenant.plan})`);
      return next();
    }

    // Check trial window (14 days from createdAt)
    const trialDays = 14;
    const trialEnd = new Date(tenant.createdAt);
    trialEnd.setDate(trialEnd.getDate() + trialDays);
    const now = new Date();

    if (now <= trialEnd) {
      const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      console.log(`⏰ [TRIAL LOCK] Trial user ${tenantId} - ${daysLeft} days left`);
      return next();
    }

    console.log(`❌ [TRIAL LOCK] Free trial expired for tenant: ${tenantId}`);
    return res.status(402).json({
      success: false,
      code: 'trial_expired',
      message: 'Your free trial has expired. Please upgrade to continue.',
      trialEndDate: trialEnd.toISOString(),
      upgradeUrl: `${process.env.FRONTEND_URL}/pricing`,
    });

  } catch (err) {
    console.error('❌ [TRIAL LOCK] Middleware error:', err.message);
    console.warn('⚠️  Trial lock failed - allowing access (fail-safe)');
    return next();
  }
  */
};
