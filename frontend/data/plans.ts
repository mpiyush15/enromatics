// data/plansData.ts


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