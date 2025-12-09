'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock, ArrowRight, Download, Mail, RefreshCw } from 'lucide-react';

type PaymentStatus = 'loading' | 'paid' | 'pending' | 'failed';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order_id') || '';
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('loading');

  useEffect(() => {
    if (orderId) {
      // Verify payment status from Cashfree
      fetch(`/api/payment/verify-subscription?orderId=${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrderDetails(data.order);
          // Check ACTUAL payment status from Cashfree
          const status = data.order?.order_status;
          if (status === 'PAID') {
            setPaymentStatus('paid');
          } else if (status === 'ACTIVE' || status === 'PENDING') {
            setPaymentStatus('pending');
          } else {
            // CANCELLED, EXPIRED, TERMINATED, etc.
            setPaymentStatus('failed');
          }
          setLoading(false);
        })
        .catch(() => {
          setPaymentStatus('failed');
          setLoading(false);
        });
    } else {
      setPaymentStatus('failed');
      setLoading(false);
    }
  }, [orderId]);

  const downloadInvoice = () => {
    if (!orderDetails) return;
    setDownloading(true);
    
    // Generate invoice HTML
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .invoice-title { font-size: 32px; color: #1f2937; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .section { background: #f9fafb; padding: 20px; border-radius: 8px; }
          .section h3 { margin: 0 0 15px 0; color: #374151; font-size: 14px; text-transform: uppercase; }
          .section p { margin: 5px 0; color: #6b7280; }
          .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .table th { background: #3b82f6; color: white; padding: 12px; text-align: left; }
          .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .total-row { font-weight: bold; background: #f0f9ff; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-paid { background: #dcfce7; color: #166534; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Enromatics</div>
          <div style="text-align: right;">
            <div class="invoice-title">INVOICE</div>
            <p style="color: #6b7280; margin: 5px 0;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>
        
        <div class="details">
          <div class="section">
            <h3>Invoice Details</h3>
            <p><strong>Invoice ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            <p><strong>Status:</strong> <span class="status status-paid">PAID</span></p>
          </div>
          <div class="section">
            <h3>Customer Details</h3>
            <p><strong>Customer ID:</strong> ${orderDetails?.customer_details?.customer_id || 'N/A'}</p>
            <p><strong>Email:</strong> ${orderDetails?.customer_details?.customer_email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${orderDetails?.customer_details?.customer_phone || 'N/A'}</p>
          </div>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Billing Cycle</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${(orderDetails?.order_meta?.plan_id || 'Subscription').charAt(0).toUpperCase() + (orderDetails?.order_meta?.plan_id || 'subscription').slice(1)} Plan</td>
              <td>${(orderDetails?.order_meta?.billing_cycle || 'Monthly').charAt(0).toUpperCase() + (orderDetails?.order_meta?.billing_cycle || 'monthly').slice(1)}</td>
              <td style="text-align: right;">₹${orderDetails?.order_amount?.toLocaleString('en-IN') || '0'}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2">Total</td>
              <td style="text-align: right;">₹${orderDetails?.order_amount?.toLocaleString('en-IN') || '0'}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Enromatics - Educational Institute Management Platform</p>
          <p>support@enromatics.com | www.enromatics.com</p>
        </div>
      </body>
      </html>
    `;
    
    // Create blob and download
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Payment...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your payment status.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Payment failed or cancelled
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Not Completed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your payment was cancelled or could not be processed. No charges have been made.
            </p>
            
            {orderId && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-8 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Order ID</span>
                  <span className="text-gray-900 dark:text-white font-mono">{orderId}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Back to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                href="/subscription/plans"
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                Try Again
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need help?{' '}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment pending (in process)
  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Pending
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your payment is being processed. This may take a few minutes. You will receive a confirmation email once completed.
            </p>
            
            {orderId && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-8 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Order ID</span>
                  <span className="text-gray-900 dark:text-white font-mono">{orderId}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Check Status Again
              </button>
              
              <Link
                href="/dashboard"
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need help?{' '}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment successful (paymentStatus === 'paid')
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

            <button 
              onClick={downloadInvoice}
              disabled={downloading || !orderDetails}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {downloading ? 'Downloading...' : 'Download Invoice'}
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
