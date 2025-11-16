/**
 * Middleware to check if user's trial/subscription is active
 * Allows access during trial period and active subscriptions
 */

export const checkSubscriptionAccess = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // SuperAdmin always has access
    if (user.role === "SuperAdmin") {
      return next();
    }

    const now = new Date();
    const { subscriptionStatus, trialEndDate, subscriptionEndDate } = user;

    // Check trial status
    if (subscriptionStatus === "trial") {
      if (trialEndDate && new Date(trialEndDate) > now) {
        // Trial is still active
        return next();
      } else {
        // Trial expired
        return res.status(403).json({
          message: "Your trial has expired. Please upgrade to continue.",
          code: "TRIAL_EXPIRED",
          upgradeUrl: "/plans"
        });
      }
    }

    // Check active subscription
    if (subscriptionStatus === "active") {
      if (subscriptionEndDate && new Date(subscriptionEndDate) > now) {
        // Subscription is active
        return next();
      } else {
        // Subscription expired
        return res.status(403).json({
          message: "Your subscription has expired. Please renew to continue.",
          code: "SUBSCRIPTION_EXPIRED",
          upgradeUrl: "/plans"
        });
      }
    }

    // Subscription cancelled or expired
    if (subscriptionStatus === "cancelled" || subscriptionStatus === "expired") {
      return res.status(403).json({
        message: "Your subscription is not active. Please subscribe to continue.",
        code: "SUBSCRIPTION_INACTIVE",
        upgradeUrl: "/plans"
      });
    }

    // Default: allow access (for backwards compatibility)
    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    res.status(500).json({ message: "Error checking subscription status" });
  }
};

/**
 * Helper function to check if trial is about to expire (within 3 days)
 */
export const isTrialExpiringSoon = (trialEndDate) => {
  if (!trialEndDate) return false;
  
  const now = new Date();
  const end = new Date(trialEndDate);
  const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  
  return daysRemaining <= 3 && daysRemaining > 0;
};

/**
 * Helper function to get remaining trial days
 */
export const getRemainingTrialDays = (trialEndDate) => {
  if (!trialEndDate) return 0;
  
  const now = new Date();
  const end = new Date(trialEndDate);
  const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  
  return daysRemaining > 0 ? daysRemaining : 0;
};

/**
 * Cron job helper: Update subscription status for expired trials/subscriptions
 * Call this daily or hourly to auto-update expired subscriptions
 */
export const updateExpiredSubscriptions = async (User) => {
  try {
    const now = new Date();

    // Find and update expired trials
    await User.updateMany(
      {
        subscriptionStatus: "trial",
        trialEndDate: { $lt: now }
      },
      {
        $set: { subscriptionStatus: "expired" }
      }
    );

    // Find and update expired subscriptions
    await User.updateMany(
      {
        subscriptionStatus: "active",
        subscriptionEndDate: { $lt: now }
      },
      {
        $set: { subscriptionStatus: "expired" }
      }
    );

    console.log("✅ Updated expired subscriptions");
  } catch (error) {
    console.error("❌ Error updating expired subscriptions:", error);
  }
};
