"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader, ArrowLeft } from "lucide-react";
import Link from "next/link";

function UpgradeStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error" | "processing">("loading");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Get order ID from search params
        const orderId = searchParams?.get("order_id");
        const cf_payment_id = searchParams?.get("cf_payment_id");

        if (!orderId) {
          setStatus("error");
          setMessage("No order information found");
          return;
        }

        // Verify payment with backend
        const response = await fetch("/api/payment/verify-upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ orderId, cf_payment_id }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("Your payment has been processed successfully! Your subscription is being upgraded.");
          setDetails(data.details);

          // Redirect to dashboard after 5 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 5000);
        } else {
          setStatus("error");
          setMessage(data.message || "Payment verification failed");
          setDetails(data.details);
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Error checking payment status");
      }
    };

    checkPaymentStatus();
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful! 🎉</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

            {details && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Plan:</strong> {details.planName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Amount:</strong> ₹{details.amount?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Billing:</strong> {details.billingCycle}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              You'll be redirected to your dashboard in a few seconds...
            </p>

            <Link href="/dashboard">
              <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                Go to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Failed</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          {details?.orderId && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Order ID: <code className="font-mono text-xs">{details.orderId}</code>
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              ← Try Again
            </button>
            <Link href="/dashboard">
              <button className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                Go to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpgradeStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <UpgradeStatusContent />
    </Suspense>
  );
}
