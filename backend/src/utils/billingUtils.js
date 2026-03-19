/**
 * Billing Utilities - Calculate and manage subscription billing schedules
 * Issue 8 Fix: Auto-renew & billing cycle management
 */

/**
 * Calculate next billing date based on current date and billing cycle
 * @param {Date} currentDate - Current date (default: now)
 * @param {string} billingCycle - 'monthly' or 'annual'
 * @returns {Date} Next billing date
 */
export const calculateNextBillingDate = (currentDate = new Date(), billingCycle = 'monthly') => {
  const nextDate = new Date(currentDate);
  
  if (billingCycle === 'annual') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else if (billingCycle === 'monthly') {
    // Add one month
    if (nextDate.getMonth() === 11) {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      nextDate.setMonth(0);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
  }
  
  return nextDate;
};

/**
 * Calculate days until renewal
 * @param {Date} nextBillingDate - Next billing date
 * @returns {number} Days until renewal (can be negative if overdue)
 */
export const calculateDaysUntilRenewal = (nextBillingDate) => {
  if (!nextBillingDate) {
    return null;
  }
  
  const now = new Date();
  const next = new Date(nextBillingDate);
  const daysMs = next - now;
  
  return Math.ceil(daysMs / (1000 * 60 * 60 * 24));
};

/**
 * Check if subscription is due for renewal
 * @param {Date} nextBillingDate - Next billing date
 * @returns {boolean}
 */
export const isRenewalDue = (nextBillingDate) => {
  if (!nextBillingDate) {
    return false;
  }
  return new Date() >= new Date(nextBillingDate);
};

/**
 * Check if renewal reminder should be sent
 * @param {Date} nextBillingDate - Next billing date
 * @param {boolean} reminderSent - Whether reminder was already sent
 * @param {number} daysBeforeExpiry - Send reminder N days before expiry
 * @returns {boolean}
 */
export const shouldSendRenewalReminder = (
  nextBillingDate,
  reminderSent = false,
  daysBeforeExpiry = 7
) => {
  if (!nextBillingDate || reminderSent) {
    return false;
  }
  
  const daysUntil = calculateDaysUntilRenewal(nextBillingDate);
  return daysUntil !== null && daysUntil > 0 && daysUntil <= daysBeforeExpiry;
};

/**
 * Get billing cycle display name
 * @param {string} cycle - 'monthly' or 'annual'
 * @returns {string} Display name
 */
export const getBillingCycleDisplay = (cycle) => {
  const display = {
    monthly: 'Monthly',
    annual: 'Annual'
  };
  return display[cycle] || cycle;
};

/**
 * Get renewal status display
 * @param {object} metadata - Subscription metadata object
 * @returns {object} Status info
 */
export const getRenewalStatus = (metadata) => {
  if (!metadata?.nextBillingDate) {
    return {
      status: 'unknown',
      display: 'No renewal scheduled',
      color: 'gray'
    };
  }
  
  const daysUntil = calculateDaysUntilRenewal(metadata.nextBillingDate);
  
  if (daysUntil < 0) {
    return {
      status: 'overdue',
      display: `Overdue ${Math.abs(daysUntil)} days`,
      daysUntil,
      color: 'red'
    };
  }
  
  if (daysUntil === 0) {
    return {
      status: 'today',
      display: 'Renewing today',
      daysUntil: 0,
      color: 'orange'
    };
  }
  
  if (daysUntil <= 7) {
    return {
      status: 'due_soon',
      display: `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
      daysUntil,
      color: 'yellow'
    };
  }
  
  return {
    status: 'active',
    display: `Renews in ${daysUntil} days`,
    daysUntil,
    color: 'green'
  };
};

/**
 * Get renewal action display
 * @param {object} metadata - Subscription metadata
 * @returns {string} Action text
 */
export const getRenewalAction = (metadata) => {
  if (!metadata?.autoRenew) {
    return 'Manual renewal required';
  }
  
  return 'Auto-renews';
};

/**
 * Format billing summary
 * @param {object} metadata - Subscription metadata
 * @returns {string} Formatted summary
 */
export const formatBillingSummary = (metadata) => {
  if (!metadata) {
    return 'No billing information';
  }
  
  const cycle = getBillingCycleDisplay(metadata.billingCycle);
  const autoRenew = metadata.autoRenew ? 'Auto-renews' : 'Manual renewal';
  
  if (metadata.nextBillingDate) {
    const status = getRenewalStatus(metadata);
    return `${cycle} billing • ${autoRenew} • ${status.display}`;
  }
  
  return `${cycle} billing • ${autoRenew}`;
};

/**
 * Migrate billing data from TenantSubscription to Tenant
 * @param {object} tenantSubscription - TenantSubscription document
 * @returns {object} Metadata object for Tenant
 */
export const migrateBillingMetadata = (tenantSubscription) => {
  if (!tenantSubscription) {
    return null;
  }
  
  return {
    billingCycle: tenantSubscription.billingCycle || 'monthly',
    autoRenew: tenantSubscription.subscription?.autoRenew ?? true,
    nextBillingDate: calculateNextBillingDate(
      tenantSubscription.subscription?.endDate || new Date(),
      tenantSubscription.billingCycle || 'monthly'
    ),
    renewalReminderSent: false,
    lastRenewalDate: tenantSubscription.subscription?.startDate || new Date()
  };
};

/**
 * Sync metadata from TenantSubscription to Tenant
 * @param {object} tenant - Tenant model instance
 * @param {object} tenantSubscription - TenantSubscription model instance
 * @returns {void} Updates tenant in-place
 */
export const syncBillingMetadata = (tenant, tenantSubscription) => {
  if (!tenant || !tenantSubscription) {
    return;
  }
  
  const billing = tenantSubscription.billingCycle || 'monthly';
  
  tenant.subscriptionMetadata = {
    billingCycle: billing,
    autoRenew: tenantSubscription.subscription?.autoRenew ?? true,
    nextBillingDate: calculateNextBillingDate(
      tenantSubscription.subscription?.endDate || new Date(),
      billing
    ),
    renewalReminderSent: tenant.subscriptionMetadata?.renewalReminderSent || false,
    lastRenewalDate: tenant.subscriptionMetadata?.lastRenewalDate || new Date()
  };
};

/**
 * Get billing period in days
 * @param {string} billingCycle - 'monthly' or 'annual'
 * @returns {number} Days in billing cycle (approximate)
 */
export const getBillingPeriodDays = (billingCycle) => {
  const days = {
    monthly: 30,  // Approximate
    annual: 365
  };
  return days[billingCycle] || 30;
};

/**
 * Calculate discount percentage for annual vs monthly
 * @param {number} monthlyPrice - Monthly price
 * @param {number} annualPrice - Annual price
 * @returns {number} Discount percentage
 */
export const calculateAnnualDiscount = (monthlyPrice, annualPrice) => {
  if (!monthlyPrice || !annualPrice) {
    return 0;
  }
  
  const monthlyTotal = monthlyPrice * 12;
  const discount = ((monthlyTotal - annualPrice) / monthlyTotal) * 100;
  
  return Math.round(discount);
};

export default {
  calculateNextBillingDate,
  calculateDaysUntilRenewal,
  isRenewalDue,
  shouldSendRenewalReminder,
  getBillingCycleDisplay,
  getRenewalStatus,
  getRenewalAction,
  formatBillingSummary,
  migrateBillingMetadata,
  syncBillingMetadata,
  getBillingPeriodDays,
  calculateAnnualDiscount
};
