/**
 * UNIFIED SUBSCRIPTION PLAN TYPES
 * ================================
 * This file is the SINGLE SOURCE OF TRUTH for all plan-related types.
 * Used by:
 * - Public /plans page
 * - SuperAdmin /dashboard/superadmin/plans page
 * - API routes
 * - Checkout flow
 * 
 * DO NOT define plan interfaces elsewhere. Import from here.
 */

// ============================================
// FEATURE TYPES
// ============================================

/**
 * Feature can be stored as:
 * - String (legacy): "Up to 100 students"
 * - Object (new): { name: "Up to 100 students", enabled: true }
 */
export interface FeatureItem {
  name: string;
  enabled: boolean;
}

export type Feature = string | FeatureItem;

// ============================================
// QUOTA TYPES
// ============================================

export interface PlanQuotas {
  students: number | string;  // number or "Unlimited" or "Trial Access"
  staff: number | string;     // number or "Unlimited" or "Trial Access"
  storage: string;            // "Standard" | "Enhanced" | "Unlimited" | "Trial Access"
  concurrentTests: number;
}

// ============================================
// SUBSCRIPTION PLAN - DATABASE MODEL
// ============================================

/**
 * Full SubscriptionPlan as stored in MongoDB
 * This matches the Mongoose schema exactly
 */
export interface SubscriptionPlan {
  _id: string;                          // MongoDB ObjectId as string
  id: string;                           // Plan slug: "trial" | "basic" | "pro" | "enterprise"
  name: string;                         // Display name: "Trial" | "Basic" | "Pro" | "Enterprise"
  description: string;                  // Plan description text
  
  // Pricing
  monthlyPrice: number | string;        // Number or "Free" or "Custom"
  annualPrice: number | string;         // Number or "Free" or "Custom"
  
  // Quotas & Limits
  quotas: PlanQuotas;
  
  // Features
  features: Feature[];                  // Can be string[] or FeatureItem[]
  highlightFeatures: string[];          // Short feature tags for cards
  
  // UI Settings
  buttonLabel: string;                  // CTA button text
  popular: boolean;                     // Show "Most Popular" badge
  displayOrder?: number;                // Sort order (0 = first)
  cta?: string;                         // Special CTA type: "trial" | undefined
  
  // Status
  status: 'active' | 'inactive' | 'archived';
  isVisible: boolean;                   // Show on public /plans page
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Optional metadata
  createdBy?: string;
  updatedBy?: string;
}

// ============================================
// PLAN TYPES FOR DIFFERENT CONTEXTS
// ============================================

/**
 * Public plan - subset of fields shown to users
 * Excludes internal fields like createdBy, updatedBy
 */
export type PublicPlan = Omit<SubscriptionPlan, 'createdBy' | 'updatedBy' | 'status'> & {
  status?: 'active';  // Public plans are always active
};

/**
 * Plan for editing in SuperAdmin
 */
export type EditablePlan = SubscriptionPlan;

/**
 * Plan update payload (PATCH)
 */
export interface PlanUpdatePayload {
  monthlyPrice?: number | string;
  annualPrice?: number | string;
  features?: Feature[];
  highlightFeatures?: string[];
  isVisible?: boolean;
  popular?: boolean;
  status?: 'active' | 'inactive' | 'archived';
  buttonLabel?: string;
  description?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get feature display text from Feature (string or FeatureItem)
 */
export const getFeatureText = (feature: Feature): string => {
  if (typeof feature === 'string') {
    // Remove leading checkmark if present
    return feature.replace(/^[✓✔️]\s*/, '');
  }
  return feature.name.replace(/^[✓✔️]\s*/, '');
};

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (feature: Feature): boolean => {
  if (typeof feature === 'string') return true;
  return feature.enabled;
};

/**
 * Normalize features to FeatureItem[] format
 * Converts string[] to FeatureItem[] for editing
 */
export const normalizeFeatures = (features: Feature[]): FeatureItem[] => {
  if (!features || features.length === 0) return [];
  
  return features.map(f => {
    if (typeof f === 'string') {
      return { 
        name: f.replace(/^[✓✔️]\s*/, ''), 
        enabled: true 
      };
    }
    return {
      name: f.name.replace(/^[✓✔️]\s*/, ''),
      enabled: f.enabled
    };
  });
};

/**
 * Format price for display
 */
export const formatPrice = (price: number | string, cycle: 'monthly' | 'annual' = 'monthly'): string => {
  if (typeof price === 'string') {
    return price; // "Free" or "Custom"
  }
  return `₹${price.toLocaleString('en-IN')}/${cycle === 'monthly' ? 'mo' : 'yr'}`;
};

/**
 * Calculate annual savings
 */
export const calculateSavings = (monthlyPrice: number | string, annualPrice: number | string): number | null => {
  if (typeof monthlyPrice !== 'number' || typeof annualPrice !== 'number') {
    return null;
  }
  return (monthlyPrice * 12) - annualPrice;
};

// ============================================
// PLAN IDs (Constants)
// ============================================

export const PLAN_IDS = {
  TRIAL: 'trial',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type PlanId = typeof PLAN_IDS[keyof typeof PLAN_IDS];

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PlansApiResponse {
  success: boolean;
  plans: SubscriptionPlan[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PlanApiResponse {
  success: boolean;
  plan: SubscriptionPlan;
  message?: string;
}

export interface PlanUpdateResponse {
  success: boolean;
  plan?: SubscriptionPlan;
  message?: string;
}
