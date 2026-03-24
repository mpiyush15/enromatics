/**
 * Subscription Lifecycle Service - Manage subscription status transitions
 * Issue 9 Fix: Auto-expiry, status validation, lifecycle tracking
 */

import TenantSubscription from '../models/TenantSubscription.js';
import Tenant from '../models/Tenant.js';

// Valid status transitions
const VALID_TRANSITIONS = {
  pending: ['trial', 'active', 'cancelled'],
  trial: ['active', 'expired', 'cancelled'],
  active: ['expired', 'cancelled'],
  expired: ['active', 'cancelled'],
  inactive: ['active', 'cancelled'],
  cancelled: []  // Terminal state
};

// Grace period config (in days)
const GRACE_PERIODS = {
  trial: 0,      // No grace for trial
  active: 3,     // 3 days grace before marking inactive
  expired: 7     // 7 days to reactivate before marking inactive
};

/**
 * Check if status transition is valid
 */
export const isValidTransition = (fromStatus, toStatus) => {
  if (fromStatus === toStatus) return true;
  return VALID_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
};

/**
 * Get valid next statuses for current status
 */
export const getValidNextStatuses = (currentStatus) => {
  return VALID_TRANSITIONS[currentStatus] || [];
};

/**
 * Check if subscription is expired
 */
export const isSubscriptionExpired = (subscription) => {
  if (!subscription?.subscription?.endDate) {
    return false;
  }
  return new Date() > new Date(subscription.subscription.endDate);
};

/**
 * Check if subscription is in grace period
 */
export const isInGracePeriod = (subscription) => {
  if (!subscription?.subscription?.endDate) {
    return false;
  }
  
  const gracePeriodDays = GRACE_PERIODS[subscription.subscription.status] || 0;
  const gracePeriodMs = gracePeriodDays * 24 * 60 * 60 * 1000;
  const gracePeriodEnd = new Date(subscription.subscription.endDate).getTime() + gracePeriodMs;
  
  return new Date().getTime() <= gracePeriodEnd;
};

/**
 * Days remaining until expiry
 */
export const daysUntilExpiry = (subscription) => {
  if (!subscription?.subscription?.endDate) {
    return null;
  }
  
  const now = new Date();
  const endDate = new Date(subscription.subscription.endDate);
  const daysMs = endDate - now;
  
  return Math.ceil(daysMs / (1000 * 60 * 60 * 24));
};

/**
 * Check if subscription needs status update
 */
export const needsStatusUpdate = (subscription) => {
  if (!subscription) return false;
  
  const currentStatus = subscription.subscription.status;
  const expired = isSubscriptionExpired(subscription);
  const inGrace = isInGracePeriod(subscription);
  
  // If expired and not in grace period, mark as inactive
  if (expired && !inGrace && currentStatus !== 'inactive') {
    return {
      current: currentStatus,
      next: 'inactive',
      reason: 'Grace period expired'
    };
  }
  
  // If expired but in grace period, keep as is
  if (expired && inGrace && currentStatus !== 'expired') {
    return {
      current: currentStatus,
      next: 'expired',
      reason: 'End date passed'
    };
  }
  
  return null;
};

/**
 * Update subscription status with validation
 */
export const updateSubscriptionStatus = async (subscription, newStatus, reason = '') => {
  const currentStatus = subscription.subscription.status;
  
  // Validate transition
  if (!isValidTransition(currentStatus, newStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
      `Valid options: ${getValidNextStatuses(currentStatus).join(', ')}`
    );
  }
  
  subscription.subscription.status = newStatus;
  
  // Track status change
  if (!subscription.statusHistory) {
    subscription.statusHistory = [];
  }
  
  subscription.statusHistory.push({
    from: currentStatus,
    to: newStatus,
    reason: reason,
    changedAt: new Date()
  });
  
  subscription.updatedAt = new Date();
  return subscription.save();
};

/**
 * Auto-expire subscriptions that have passed their end date
 * Should be run periodically (cron job)
 */
export const autoExpireSubscriptions = async () => {
  console.log('🔄 Starting auto-expire check...');
  
  try {
    // Find subscriptions that need status update
    const subscriptions = await TenantSubscription.find({
      'subscription.endDate': { $lt: new Date() },
      'subscription.status': { $nin: ['expired', 'inactive', 'cancelled'] }
    });
    
    console.log(`Found ${subscriptions.length} subscriptions to process`);
    
    const results = {
      expired: [],
      inactive: [],
      errors: []
    };
    
    for (const subscription of subscriptions) {
      try {
        const update = needsStatusUpdate(subscription);
        
        if (update) {
          const oldStatus = subscription.subscription.status;
          await updateSubscriptionStatus(
            subscription,
            update.next,
            update.reason
          );
          
          // Also update tenant plan if going inactive
          if (update.next === 'inactive') {
            await Tenant.updateOne(
              { tenantId: subscription.tenantId },
              { plan: 'trial' }
            );
            results.inactive.push({
              tenantId: subscription.tenantId,
              from: oldStatus,
              to: update.next
            });
          } else {
            results.expired.push({
              tenantId: subscription.tenantId,
              from: oldStatus,
              to: update.next
            });
          }
        }
      } catch (error) {
        results.errors.push({
          tenantId: subscription.tenantId,
          error: error.message
        });
        console.error(`Error processing ${subscription.tenantId}:`, error.message);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in autoExpireSubscriptions:', error);
    throw error;
  }
};

/**
 * Send expiry warning notifications
 * Should be run periodically (cron job)
 */
export const sendExpiryWarnings = async (daysBeforeExpiry = 7) => {
  console.log(`🔔 Checking subscriptions expiring in ${daysBeforeExpiry} days...`);
  
  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);
    
    const subscriptions = await TenantSubscription.find({
      'subscription.endDate': {
        $gte: new Date(),
        $lte: targetDate
      },
      'subscription.status': { $in: ['trial', 'active'] }
    });
    
    console.log(`Found ${subscriptions.length} subscriptions expiring soon`);
    
    const results = [];
    
    for (const subscription of subscriptions) {
      try {
        const daysLeft = daysUntilExpiry(subscription);
        
        // TODO: Integrate with notification service
        const notification = {
          tenantId: subscription.tenantId,
          type: 'subscription_expiry_warning',
          daysLeft: daysLeft,
          plan: subscription.planType,
          endDate: subscription.subscription.endDate,
          timestamp: new Date()
        };
        
        results.push(notification);
      } catch (error) {
        console.error(`Error preparing notification for ${subscription.tenantId}:`, error.message);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in sendExpiryWarnings:', error);
    throw error;
  }
};

/**
 * Renew a subscription
 */
export const renewSubscription = async (subscription, newEndDate, newPlanType = null) => {
  if (subscription.subscription.status === 'cancelled') {
    throw new Error('Cannot renew a cancelled subscription');
  }
  
  // Update end date
  subscription.subscription.endDate = newEndDate;
  subscription.subscription.status = 'active';
  subscription.subscription.startDate = new Date();
  
  // Update plan if provided
  if (newPlanType) {
    subscription.planType = newPlanType;
  }
  
  // Record renewal
  if (!subscription.renewalHistory) {
    subscription.renewalHistory = [];
  }
  
  subscription.renewalHistory.push({
    renewedAt: new Date(),
    endDate: newEndDate,
    planType: subscription.planType
  });
  
  return subscription.save();
};

/**
 * Get subscription status summary
 */
export const getSubscriptionSummary = (subscription) => {
  if (!subscription) return null;
  
  const status = subscription.subscription.status;
  const endDate = subscription.subscription.endDate;
  const daysLeft = daysUntilExpiry(subscription);
  const isExpired = isSubscriptionExpired(subscription);
  const inGrace = isInGracePeriod(subscription);
  
  return {
    tenantId: subscription.tenantId,
    plan: subscription.planType,
    status: status,
    endDate: endDate,
    daysLeft: daysLeft,
    isExpired: isExpired,
    inGracePeriod: inGrace,
    autoRenew: subscription.subscription.autoRenew,
    billingCycle: subscription.billingCycle,
    needsUpdate: needsStatusUpdate(subscription) !== null
  };
};

/**
 * Get all subscriptions by status
 */
export const getSubscriptionsByStatus = async (status) => {
  return TenantSubscription.find({
    'subscription.status': status
  });
};

/**
 * Get subscriptions in grace period
 */
export const getSubscriptionsInGracePeriod = async () => {
  const subscriptions = await TenantSubscription.find({
    'subscription.status': 'expired'
  });
  
  return subscriptions.filter(sub => isInGracePeriod(sub));
};

/**
 * Lifecycle status enum
 */
export const SUBSCRIPTION_STATUS = {
  PENDING: 'pending',      // Awaiting activation
  TRIAL: 'trial',          // Trial period active
  ACTIVE: 'active',        // Paid/active subscription
  EXPIRED: 'expired',      // End date passed, in grace period
  INACTIVE: 'inactive',    // Deactivated after grace period
  CANCELLED: 'cancelled'   // Explicitly cancelled
};

/**
 * Lifecycle events
 */
export const LIFECYCLE_EVENTS = {
  CREATED: 'created',
  ACTIVATED: 'activated',
  RENEWED: 'renewed',
  EXPIRED: 'expired',
  GRACE_PERIOD_STARTED: 'grace_period_started',
  GRACE_PERIOD_ENDED: 'grace_period_ended',
  CANCELLED: 'cancelled',
  STATUS_CHANGED: 'status_changed'
};

export default {
  isValidTransition,
  getValidNextStatuses,
  isSubscriptionExpired,
  isInGracePeriod,
  daysUntilExpiry,
  needsStatusUpdate,
  updateSubscriptionStatus,
  autoExpireSubscriptions,
  sendExpiryWarnings,
  renewSubscription,
  getSubscriptionSummary,
  getSubscriptionsByStatus,
  getSubscriptionsInGracePeriod,
  SUBSCRIPTION_STATUS,
  LIFECYCLE_EVENTS,
  VALID_TRANSITIONS,
  GRACE_PERIODS
};
