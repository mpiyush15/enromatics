// ...existing code...
// Subscription plans config
// Each plan has monthly and annual pricing (annual = ~15% discount for annual)
export const PLANS = [
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
    priceMonthly: 10,
    priceAnnual: 10, // Testing at Rs 10
    description: 'Perfect for small coaching institutes',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 10,
    priceAnnual: 10, // Testing at Rs 10
    description: 'For growing educational institutions',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 10,
    priceAnnual: 10,
    description: 'For large-scale operations with advanced needs',
  },
  // Keep old names as aliases for backward compatibility
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 10,
    priceAnnual: 10,
    description: 'Basic features for small institutes (legacy)',
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 10,
    priceAnnual: 10,
    description: 'Advanced features for growing institutes (legacy)',
  }
];
