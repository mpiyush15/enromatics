'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Download, Mail } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order_id') || '';
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // Verify payment status
      fetch(`/api/payment/verify-subscription?orderId=${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrderDetails(data.order);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thank you for subscribing to Enromatics. Your account is now active.
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Order Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order ID</span>
                  <span className="text-gray-900 dark:text-white font-mono">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan</span>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {orderDetails?.order_meta?.plan_id || 'Professional'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Billing</span>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {orderDetails?.order_meta?.billing_cycle || 'Monthly'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    ₹{orderDetails?.order_amount?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Email Confirmation */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <Mail className="w-4 h-4" />
            <span>A confirmation email has been sent to your email address</span>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>

            <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download Invoice
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help?{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* What's Next */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            What's Next?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Set up your institute profile</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add your institute details, logo, and contact information
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Add students and staff</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Import or manually add your students and staff members
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Start managing</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track attendance, manage fees, and communicate with parents
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Verifying payment...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
