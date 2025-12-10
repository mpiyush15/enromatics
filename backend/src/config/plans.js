// ...existing code...
// Subscription plans config
// Each plan has monthly and annual pricing (all set to Rs 10 for testing)
export const PLANS = [
  {
    id: 'test',
    name: 'Test Plan',
    priceMonthly: 10,
    priceAnnual: 10,
    description: 'Test plan for payment verification',
  },
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 10,
    priceAnnual: 10,
    description: 'Basic features for small institutes',
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 10,
    priceAnnual: 10,
    description: 'Advanced features for growing institutes',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 10,
    priceAnnual: 10,
    description: 'For large-scale operations with advanced needs',
  }
];
