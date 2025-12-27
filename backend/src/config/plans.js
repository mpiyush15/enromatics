// ...existing code...
// Subscription plans config
// Each plan has monthly and annual pricing
// ✅ UPDATED: Prices synced with database (SuperAdmin dynamic pricing)
export const PLANS = [
  {
    id: 'trial',
    name: 'Trial',
    priceMonthly: 0,
    priceAnnual: 0,
    description: '14-day free trial',
  },
  {
    id: 'test',
    name: 'Test Plan',
    priceMonthly: 10,
    priceAnnual: 10,
    description: 'Test plan for QA - ₹10 only',
  },
  {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 999,
    priceAnnual: 8999, // ~25% savings
    description: 'Perfect for small coaching institutes',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 2499,
    priceAnnual: 14999, // Save ₹15,000/year (50% off)
    description: 'For growing educational institutions',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 4999,
    priceAnnual: 49999,
    description: 'For large-scale operations with advanced needs',
  },
  // Keep old names as aliases for backward compatibility
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 999,
    priceAnnual: 8999,
    description: 'Basic features for small institutes (legacy)',
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 2499,
    priceAnnual: 14999,
    description: 'Advanced features for growing institutes (legacy)',
  }
];
