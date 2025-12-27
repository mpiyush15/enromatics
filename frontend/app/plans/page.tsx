'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import useSWR from 'swr';

// Import unified types - SINGLE SOURCE OF TRUTH
import { 
  SubscriptionPlan, 
  PlansApiResponse,
  getFeatureText, 
  isFeatureEnabled,
  formatPrice,
  calculateSavings,
  PLAN_IDS
} from '@/types/subscription-plan';

// SWR fetcher - no cache, always fresh data
const fetcher = async (url: string) => {
  const res = await fetch(url, { 
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showComparison, setShowComparison] = useState(false);

  // SWR for live data - revalidates on focus, every 30 seconds, and no cache
  const { data, error, isLoading, mutate } = useSWR<PlansApiResponse>(
    '/api/subscription-plans/public',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000,
    }
  );

  // Sort plans by displayOrder
  const plans = data?.plans?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading plans...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Failed to load plans</p>
          <button 
            onClick={() => mutate()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your educational institution. All plans include 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                Save now
              </span>
            </button>
          </div>
        </div>

  {/* Plans Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            return (
              <div
                key={plan.id}
                className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  plan.popular
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 md:scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                } p-8`}
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
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {typeof price === 'string' && (price === 'Free' || price === 'Custom') 
                        ? price 
                        : `₹${price.toLocaleString('en-IN')}`}
                    </span>
                    {typeof price === 'number' && (
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'annual' && typeof plan.monthlyPrice === 'number' && typeof plan.annualPrice === 'number' && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      Save ₹{((plan.monthlyPrice * 12) - plan.annualPrice).toLocaleString('en-IN')} annually
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                  {plan.id === 'trial' ? (
                    <Link
                      href={`/signup?plan=${plan.id}`}
                      className="block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                    >
                      🎉 {plan.buttonLabel}
                    </Link>
                  ) : (
                    <Link
                      href={`/subscription/checkout?planId=${plan.id}&cycle=${billingCycle}`}
                      className="block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Buy Now
                    </Link>
                  )}
                </div>

                {/* Features - only show enabled features */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-8">
                  {plan.features.filter(isFeatureEnabled).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getFeatureText(feature)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Compare Plans Button */}
        <div className="text-center mb-16">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span>{showComparison ? 'Hide' : 'Compare Plans'} - Detailed Features</span>
            {showComparison ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Detailed Comparison Table */}
        {showComparison && (
          <div className="mb-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 overflow-x-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Complete Feature Comparison
            </h2>

            {/* Core Features */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-blue-500">
                Core Platform Features
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Features</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Basic</th>
                      <th className="text-center py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">Pro ⭐</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Web Portal (Admin / Staff / Student)</td>
                      <td className="text-center py-4 px-4">✅</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">✅</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Secure Institute Subdomain</td>
                      <td className="text-center py-4 px-4">✅</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">✅</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-semibold">Student Limit</td>
                      <td className="text-center py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">Up to 100</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20 font-semibold text-blue-600 dark:text-blue-400">Up to 300</td>
                      <td className="text-center py-4 px-4 font-semibold text-green-600 dark:text-green-400">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-semibold">Staff Accounts</td>
                      <td className="text-center py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">Up to 5</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20 font-semibold text-green-600 dark:text-green-400">Unlimited</td>
                      <td className="text-center py-4 px-4 font-semibold text-green-600 dark:text-green-400">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Role-Based Access Control</td>
                      <td className="text-center py-4 px-4">✅</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">✅</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Attendance Management</td>
                      <td className="text-center py-4 px-4">✅</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">✅</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Fees Management & Receipts</td>
                      <td className="text-center py-4 px-4">✅</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">✅</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Email Notifications</td>
                      <td className="text-center py-4 px-4">✅</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">✅</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Exams & Results Management</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">✅</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Advanced Reports & Analytics</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">✅</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Audit Logs & Data Backup</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Multi-Branch Management</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile App Features */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-purple-500">
                Mobile App Features
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Mobile App</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Basic</th>
                      <th className="text-center py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">Pro ⭐</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Student Mobile App</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">✅ <span className="text-xs text-gray-500">(Basic App)</span></td>
                      <td className="text-center py-4 px-4">✅ <span className="text-xs text-green-600">(Full App)</span></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Parent Mobile App</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Push Notifications</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Custom Branding (App)</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Play Store / App Store Publishing</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Automation & Marketing */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-green-500">
                Automation & Marketing
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Automation & Marketing</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Basic</th>
                      <th className="text-center py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">Pro ⭐</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">WhatsApp Business Automation (WABA)</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">🟡 <span className="text-xs text-orange-600">Beta</span></td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Automated Fee Reminders</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">🟡 <span className="text-xs text-orange-600">Beta</span></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Social Media Marketing Tools</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">🟡 <span className="text-xs text-orange-600">Beta</span></td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Ads Management Dashboard</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">🟡 <span className="text-xs text-orange-600">Beta</span></td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Lead & Enquiry Management</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Support */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-orange-500">
                Support & Services
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Support</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Basic</th>
                      <th className="text-center py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">Pro ⭐</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Standard Support</td>
                      <td className="text-center py-4 px-4">✅</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">✅</td>
                      <td className="text-center py-4 px-4">❌</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Priority Support</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Dedicated Account Manager</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">Custom Domain Support</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">SLA Commitment</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4 bg-blue-50 dark:bg-blue-900/20">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                <span className="font-semibold">Legend:</span> ✅ = Available  |  ❌ = Not Available  |  🟡 = Beta (In Testing)
              </p>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto py-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I switch plans anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
              },
              {
                q: 'Do you offer a free trial?',
                a: 'Yes, all plans come with a 14-day free trial. No credit card required to get started.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards, UPI, and net banking through Cashfree payment gateway.',
              },
              {
                q: 'Is there a discount for annual billing?',
                a: 'Yes! Pay for a year and save 30% compared to monthly billing.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime. Your access will continue until the end of your billing period.',
              },
              {
                q: 'Do your prices cover WhatsApp (WABA) message costs and Meta Ad costs?',
                a: 'No, those costs are not included in our pricing. WhatsApp Business API (WABA) message costs and Meta advertising costs depend on your monthly usage and are paid directly to Meta.',
              },
              {
                q: 'What can I do with WhatsApp & Social Media integration?',
                a: 'Our platform lets you connect your WhatsApp Business Account (WABA) and social media (Facebook, Instagram) to: send bulk WhatsApp messages & templates, automate follow-up reminders, capture leads from Facebook/Instagram ads directly into CRM, schedule & publish social media posts, track engagement analytics, and manage all conversations in one inbox.',
              },
              {
                q: 'What is the CRM / Lead Manager feature?',
                a: 'The CRM / Lead Manager helps you track and convert enquiries into students. Features include: lead pipeline with stages (New → Contacted → Interested → Follow-up → Negotiation → Converted), call logging with outcomes & notes, follow-up scheduling with reminders, lead source tracking (website, WhatsApp, walk-in, social media, referral), counsellor assignment & performance analytics, priority tagging, and conversion tracking with expected vs actual fees.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {item.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 rounded-2xl text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of educational institutions already using our platform.
          </p>
          <Link
            href="/subscription/checkout"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
