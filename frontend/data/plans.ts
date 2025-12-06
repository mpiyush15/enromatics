// data/plansData.ts

export const subscriptionPlans = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 1999,
    annualPrice: Math.round(1999 * 12 * 0.7), // 30% discount
    description: "Perfect for small teams and startups",
    features: [
      "✓ Up to 5 users",
      "✓ Student management",
      "✓ Basic analytics",
      "✓ Email support",
      "✓ Mobile app access",
    ],
    highlightFeatures: ["Student Database", "Basic Reports", "Email Support"],
    buttonLabel: "Start with Starter",
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    monthlyPrice: 2999,
    annualPrice: Math.round(2999 * 12 * 0.7),
    description: "For growing educational institutions",
    features: [
      "✓ Up to 50 users",
      "✓ Advanced analytics",
      "✓ WhatsApp integration",
      "✓ Priority support",
      "✓ Custom reports",
      "✓ Staff management",
    ],
    highlightFeatures: ["Advanced Analytics", "WhatsApp Integration", "Staff Mgmt"],
    buttonLabel: "Go Professional",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 4999,
    annualPrice: Math.round(4999 * 12 * 0.7),
    description: "For large-scale operations",
    features: [
      "✓ Unlimited users",
      "✓ Full feature suite",
      "✓ Facebook & Meta ads",
      "✓ 24/7 dedicated support",
      "✓ Custom integrations",
      "✓ Advanced security",
      "✓ API access",
    ],
    highlightFeatures: ["Everything", "24/7 Support", "Custom Solutions"],
    buttonLabel: "Contact Sales",
    popular: false,
  },
];

export const plans = [
  {
    id: "free",
    title: "Free Trial",
    planId: "free_trial",
    planName: "Free Trial",
    price: "0",
    description: "Try our platform for 7 days, no credit card needed.",
    features: [
      "Access social media templates",
      "WhatsApp insights (limited)",
      "1 Client Profile",
      "Limited Reports View",
    ],
    buttonLabel: "Start Free Trial",
    isFree: true,
  },
  {
    id: "pro",
    planId: "pro_plan",
    planName: "Pro Plan",
    title: "Pro Plan",
    price: "999",
    description: "Everything you need to manage your online growth.",
    features: [
      "Unlimited client uploads",
      "Full reports dashboard",
      "WhatsApp Automation",
      "Priority Support",
    ],
    buttonLabel: "Subscribe Now",
    isFree: false,
  },
];