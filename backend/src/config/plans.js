// ...existing code...
// Subscription plans config
// Each plan has monthly and annual pricing (annual = 30% discount)
export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 1999,
    priceAnnual: Math.round(1999 * 12 * 0.7), // 30% discount
    description: 'Basic features for small institutes',
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 2999,
    priceAnnual: Math.round(2999 * 12 * 0.7),
    description: 'Advanced features for growing institutes',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 4999,
    priceAnnual: Math.round(4999 * 12 * 0.7),
    description: 'Full suite for large organizations',
  }
];
