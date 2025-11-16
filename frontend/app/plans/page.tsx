"use client";

import { useState } from "react";
import Link from "next/link";

interface Plan {
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  cta: string;
  description: string;
}

export default function PlansPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  const plans: Plan[] = [
    {
      name: "Free Trial",
      price: 0,
      interval: "14 days",
      description: "Perfect for trying out the platform",
      features: [
        "Up to 50 students",
        "Basic attendance tracking",
        "Student portal access",
        "Email support",
        "Basic reports",
        "14-day trial period"
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Starter",
      price: 0, // Will be updated later
      interval: billingInterval === "monthly" ? "month" : "year",
      description: "Great for small institutes",
      features: [
        "Up to 200 students",
        "Advanced attendance tracking",
        "Student & parent portal",
        "Fee management",
        "SMS notifications",
        "Priority email support",
        "Custom reports"
      ],
      cta: "Get Started"
    },
    {
      name: "Professional",
      price: 0, // Will be updated later
      interval: billingInterval === "monthly" ? "month" : "year",
      description: "Perfect for growing institutions",
      popular: true,
      features: [
        "Up to 1000 students",
        "Everything in Starter",
        "Test & exam management",
        "Advanced analytics",
        "WhatsApp integration",
        "Multiple branches support",
        "API access",
        "Phone support"
      ],
      cta: "Get Started"
    },
    {
      name: "Enterprise",
      price: 0, // Custom pricing
      interval: "custom",
      description: "For large institutions",
      features: [
        "Unlimited students",
        "Everything in Professional",
        "Custom integrations",
        "Dedicated account manager",
        "On-premise deployment option",
        "SLA guarantee",
        "Training & onboarding",
        "24/7 priority support"
      ],
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 dark:text-white mb-4 tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-lg font-light text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start with a free 14-day trial. No credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === "monthly"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === "yearly"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border ${
                plan.popular
                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20"
                  : "border-gray-200 dark:border-gray-700"
              } p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-light text-gray-900 dark:text-white">
                    {plan.price === 0 && plan.name !== "Free Trial" ? "Custom" : `₹${plan.price}`}
                  </span>
                  {plan.price === 0 && plan.name === "Free Trial" && (
                    <span className="ml-2 text-gray-600 dark:text-gray-400 font-light">
                      for {plan.interval}
                    </span>
                  )}
                  {plan.price !== 0 && plan.name !== "Enterprise" && (
                    <span className="ml-2 text-gray-600 dark:text-gray-400 font-light">
                      /{plan.interval}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm font-light text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href={plan.name === "Enterprise" ? "/contact" : "/register"}
                className={`block w-full text-center py-3 px-4 rounded-xl font-medium transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                    : "border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-light text-gray-900 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                What happens after the 14-day trial?
              </h3>
              <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                After your trial ends, you'll be prompted to choose a paid plan. Your data will be preserved, and you can upgrade anytime during or after the trial.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Can I change plans later?
              </h3>
              <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Is my data secure?
              </h3>
              <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                Absolutely! We use industry-standard encryption and security measures. Your data is backed up daily and stored securely on cloud infrastructure.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment, no questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl font-light text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg font-light text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of institutions already using Enromatics to manage their operations efficiently.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl"
            >
              Start Your Free Trial
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}