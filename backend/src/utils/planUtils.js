/**
 * Plan Utilities - Standardized plan definitions and helpers
 * Issue 7 Fix: Standardize to 4 tiers - free, basic, pro, enterprise
 */

// Standard plan tiers
export const PLAN_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

// Feature availability by plan
export const PLAN_FEATURES = {
  free: {
    webDashboard: true,
    mobileApp: false,
    prioritySupport: false,
    offlineAccess: false,
    apiAccess: false,
    customization: false,
    ssoIntegration: false,
    advancedAnalytics: false
  },
  basic: {
    webDashboard: true,
    mobileApp: true,
    prioritySupport: false,
    offlineAccess: false,
    apiAccess: true,
    customization: false,
    ssoIntegration: false,
    advancedAnalytics: false
  },
  pro: {
    webDashboard: true,
    mobileApp: true,
    prioritySupport: true,
    offlineAccess: true,
    apiAccess: true,
    customization: true,
    ssoIntegration: true,
    advancedAnalytics: true
  },
  enterprise: {
    webDashboard: true,
    mobileApp: true,
    prioritySupport: true,
    offlineAccess: true,
    apiAccess: true,
    customization: true,
    ssoIntegration: true,
    advancedAnalytics: true
  }
};

// Pricing by plan (in INR)
export const PLAN_PRICING = {
  free: {
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'INR',
    description: 'Free tier - limited features'
  },
  basic: {
    monthlyPrice: 499,
    annualPrice: 4999,
    currency: 'INR',
    discount: '17% off with annual billing',
    description: 'Entry-level - for small institutions'
  },
  pro: {
    monthlyPrice: 999,
    annualPrice: 9999,
    currency: 'INR',
    discount: '17% off with annual billing',
    description: 'Professional - advanced features'
  },
  enterprise: {
    monthlyPrice: null,
    annualPrice: null,
    currency: 'INR',
    description: 'Custom pricing - contact sales',
    contactSales: true
  }
};

// Plan upgrade paths (what plans can upgrade to what)
export const PLAN_UPGRADE_PATHS = {
  free: ['basic', 'pro', 'enterprise'],
  basic: ['pro', 'enterprise'],
  pro: ['enterprise'],
  enterprise: []
};

/**
 * Get features available for a specific plan
 * @param {string} planType - One of: free, basic, pro, enterprise
 * @returns {object} Features object with boolean flags
 */
export const getPlanFeatures = (planType) => {
  if (!PLAN_FEATURES[planType]) {
    throw new Error(`Invalid plan type: ${planType}`);
  }
  return { ...PLAN_FEATURES[planType] };
};

/**
 * Get pricing for a specific plan
 * @param {string} planType - One of: free, basic, pro, enterprise
 * @returns {object} Pricing object
 */
export const getPlanPricing = (planType) => {
  if (!PLAN_PRICING[planType]) {
    throw new Error(`Invalid plan type: ${planType}`);
  }
  return { ...PLAN_PRICING[planType] };
};

/**
 * Check if a feature is available in a plan
 * @param {string} planType - One of: free, basic, pro, enterprise
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export const hasFeature = (planType, feature) => {
  const features = getPlanFeatures(planType);
  return features[feature] === true;
};

/**
 * Check if a plan can be upgraded to another plan
 * @param {string} fromPlan - Current plan
 * @param {string} toPlan - Target plan
 * @returns {boolean}
 */
export const canUpgradePlan = (fromPlan, toPlan) => {
  if (fromPlan === toPlan) return false;
  return PLAN_UPGRADE_PATHS[fromPlan]?.includes(toPlan) || false;
};

/**
 * Get all valid plans
 * @returns {array} Array of plan tier strings
 */
export const getValidPlans = () => {
  return Object.values(PLAN_TIERS);
};

/**
 * Validate if a plan type is valid
 * @param {string} planType - Plan to validate
 * @returns {boolean}
 */
export const isValidPlan = (planType) => {
  return getValidPlans().includes(planType);
};

/**
 * Get plan tier rank (for comparison)
 * Higher rank = higher tier
 * @param {string} planType - Plan type
 * @returns {number} Rank (0-3)
 */
export const getPlanRank = (planType) => {
  const ranks = {
    free: 0,
    basic: 1,
    pro: 2,
    enterprise: 3
  };
  return ranks[planType] ?? -1;
};

/**
 * Check if plan1 is higher tier than plan2
 * @param {string} plan1 - First plan
 * @param {string} plan2 - Second plan
 * @returns {boolean} True if plan1 is higher tier
 */
export const isPlanHigherTier = (plan1, plan2) => {
  return getPlanRank(plan1) > getPlanRank(plan2);
};

/**
 * Get next recommended upgrade from current plan
 * @param {string} currentPlan - Current plan type
 * @returns {string|null} Recommended next plan or null if enterprise
 */
export const getRecommendedUpgrade = (currentPlan) => {
  const upgradePaths = {
    free: PLAN_TIERS.BASIC,
    basic: PLAN_TIERS.PRO,
    pro: PLAN_TIERS.ENTERPRISE,
    enterprise: null
  };
  return upgradePaths[currentPlan] || null;
};

/**
 * Migrate legacy plan values to new standardized values
 * Used for Issue 7 data migration
 * @param {string} legacyPlan - Old plan value
 * @returns {string} New standardized plan value
 */
export const migrateLegacyPlan = (legacyPlan) => {
  const legacyMapping = {
    'premium': PLAN_TIERS.PRO,
    'trial': PLAN_TIERS.BASIC,
    'test': PLAN_TIERS.FREE,
    'starter': PLAN_TIERS.BASIC,
    'professional': PLAN_TIERS.PRO,
    'pro': PLAN_TIERS.PRO,
    'free': PLAN_TIERS.FREE,
    'basic': PLAN_TIERS.BASIC,
    'enterprise': PLAN_TIERS.ENTERPRISE
  };
  
  const normalizedPlan = legacyPlan?.toLowerCase();
  const mappedPlan = legacyMapping[normalizedPlan];
  
  if (!mappedPlan) {
    console.warn(`Unknown legacy plan: ${legacyPlan}, defaulting to free`);
    return PLAN_TIERS.FREE;
  }
  
  return mappedPlan;
};

/**
 * Get plan description
 * @param {string} planType - Plan type
 * @returns {string} Description
 */
export const getPlanDescription = (planType) => {
  const pricing = getPlanPricing(planType);
  return pricing.description;
};

export default {
  PLAN_TIERS,
  PLAN_FEATURES,
  PLAN_PRICING,
  PLAN_UPGRADE_PATHS,
  getPlanFeatures,
  getPlanPricing,
  hasFeature,
  canUpgradePlan,
  getValidPlans,
  isValidPlan,
  getPlanRank,
  isPlanHigherTier,
  getRecommendedUpgrade,
  migrateLegacyPlan,
  getPlanDescription
};
