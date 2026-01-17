"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader, AlertCircle, CheckCircle, ArrowLeft, CreditCard, Shield } from "lucide-react";
import Link from "next/link";

type PaymentSession = {
  sessionId: string;
  planName: string;
  billingCycle: string;
  amount: number;
  email: string;
  isExpired: boolean;
  expiresAt: string;
  status: string;
};

function UpgradeCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get("session");

  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");

  useEffect(() => {
    if (!sessionId) {
      setError("No payment session found. Invalid link.");
      setLoading(false);
      return;
    }

    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      console.log("🔍 Fetching session details for:", sessionId);
      
      if (!sessionId) {
        console.error("❌ No session ID provided");
        setError("Invalid payment link - no session ID");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/payment-links/session/${sessionId}`);
      console.log("📋 Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API error:", errorText);
        setError(`API Error: ${res.status}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("📋 Session response:", data);

      if (data.success && data.sessionId) {
        console.log("✅ Session loaded successfully");
        setSession(data);
        if (data.isExpired) {
          console.warn("⚠️ Session is expired");
          setError("This payment link has expired. Please request a new one.");
        }
      } else {
        console.error("❌ Invalid session response:", data);
        setError(data.message || "Invalid session data");
      }
    } catch (err: any) {
      console.error("❌ Fetch error:", err);
      setError(err.message || "Error loading payment session");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!session || session.isExpired) {
      setError("Payment link is expired or invalid");
      return;
    }

    setProcessingPayment(true);
    setPaymentStatus("processing");
    setError("");

    try {
      // Initialize Cashfree payment
      const response = await fetch("/api/payment/initiate-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId: session.sessionId,
          amount: session.amount,
          email: session.email,
          planName: session.planName,
          billingCycle: session.billingCycle,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentSessionId) {
        // Initialize Cashfree checkout
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.async = true;
        script.onload = () => {
          const cashfree = (window as any).Cashfree;
          if (cashfree) {
            cashfree.checkout({
              paymentSessionId: data.paymentSessionId,
              redirectTarget: "_modal",
            });
          }
        };
        document.body.appendChild(script);
      } else {
        setError(data.message || "Failed to initiate payment");
        setPaymentStatus("failed");
      }
    } catch (err: any) {
      setError(err.message || "Error processing payment");
      setPaymentStatus("failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Error</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link href="/">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                ← Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (session?.isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Link Expired</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This payment link expired on {new Date(session.expiresAt).toLocaleString()}. Please request a new link.
            </p>
            <Link href="/">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                ← Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Not Ready</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Session details are still loading. Please wait...</p>
            <Link href="/">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                ← Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Complete Payment</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            Upgrade your subscription to unlock premium features
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Plan Info */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{session?.planName}</h2>
            <p className="text-blue-100 capitalize">{session?.billingCycle} billing</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Amount</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{session?.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600 dark:text-gray-400">Email</span>
              <span className="text-gray-900 dark:text-white font-mono text-sm">{session?.email}</span>
            </div>

            {session?.expiresAt && (
              <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Expires</span>
                <span className="text-gray-900 dark:text-white text-sm">
                  {new Date(session.expiresAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">Payment Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Payment Status Messages */}
        {paymentStatus === "processing" && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-3 items-center">
            <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200">Processing your payment...</p>
            </div>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex gap-3 items-center">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-800 dark:text-green-200">Payment successful! Your upgrade is being processed.</p>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={processingPayment || paymentStatus === "processing" || paymentStatus === "success"}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mb-4"
        >
          {processingPayment ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ₹{session?.amount.toLocaleString()}
            </>
          )}
        </button>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Security Badge */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secured by Cashfree</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UpgradeCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <UpgradeCheckoutContent />
    </Suspense>
  );
}
