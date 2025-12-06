'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { subscriptionPlans } from '@/data/plans';
import { CheckCircle, Shield, CreditCard, ArrowLeft } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planId = searchParams?.get('plan') || 'starter';
  const cycleParam = searchParams?.get('cycle') || 'monthly';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    cycleParam === 'annual' ? 'annual' : 'monthly'
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    instituteName: '',
    tenantId: '',
  });

  const selectedPlan = subscriptionPlans.find((p) => p.id === planId) || subscriptionPlans[0];
  const price = billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;
  const savings = billingCycle === 'annual' ? selectedPlan.monthlyPrice * 12 - selectedPlan.annualPrice : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/payment/initiate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: formData.tenantId || formData.email.split('@')[0],
          planId: selectedPlan.id,
          email: formData.email,
          phone: formData.phone,
          billingCycle,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Use payment link if available, otherwise use session-based checkout
        const checkoutUrl = data.paymentLink || 
          `https://payments.cashfree.com/pgbillpay/order/${data.orderId}/${data.paymentSessionId}`;
        
        setPaymentUrl(checkoutUrl);
        setStatus('Payment initiated. Redirecting to payment gateway...');
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 2000);
      } else {
        setStatus('Failed to initiate payment. Please try again.');
      }
    } catch (err) {
      setStatus('Error initiating payment. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/plans"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Order Summary
            </h2>

            {/* Plan Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Plan
              </label>
              <div className="space-y-3">
                {subscriptionPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('plan', plan.id);
                      window.history.pushState({}, '', url);
                      window.location.reload();
                    }}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      plan.id === planId
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {plan.name}
                        </span>
                        {plan.popular && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        ₹{plan.monthlyPrice}/mo
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Billing Cycle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Billing Cycle
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`p-4 rounded-lg border transition-all ${
                    billingCycle === 'monthly'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white">Monthly</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ₹{selectedPlan.monthlyPrice}/month
                  </div>
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`p-4 rounded-lg border transition-all relative ${
                    billingCycle === 'annual'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save 30%
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">Annual</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ₹{Math.round(selectedPlan.annualPrice / 12)}/month
                  </div>
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{selectedPlan.name} Plan</span>
                <span>₹{price.toLocaleString('en-IN')}</span>
              </div>
              {billingCycle === 'annual' && (
                <div className="flex justify-between text-green-600">
                  <span>Annual Discount (30%)</span>
                  <span>-₹{savings.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>₹{price.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-sm text-gray-500">
                Billed {billingCycle === 'monthly' ? 'monthly' : 'annually'}
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                What's included:
              </h3>
              <div className="space-y-2">
                {selectedPlan.features.slice(0, 5).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Payment Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Payment Details
            </h2>

            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Institute Name
                </label>
                <input
                  type="text"
                  name="instituteName"
                  value={formData.instituteName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Institute Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@yourschool.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {loading ? 'Processing...' : `Pay ₹${price.toLocaleString('en-IN')}`}
              </button>

              {/* Status Message */}
              {status && (
                <div className={`p-4 rounded-lg text-center ${
                  status.includes('Error') || status.includes('Failed')
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {status}
                </div>
              )}

              {/* Manual Payment Link */}
              {paymentUrl && (
                <div className="text-center">
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Click here if not redirected automatically
                  </a>
                </div>
              )}

              {/* Terms */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By completing this purchase, you agree to our{' '}
                <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>

            {/* Payment Methods */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                Powered by Cashfree • All major payment methods accepted
              </p>
              <div className="flex justify-center gap-4 text-gray-400">
                <span className="text-2xl">💳</span>
                <span className="text-2xl">📱</span>
                <span className="text-2xl">🏦</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
