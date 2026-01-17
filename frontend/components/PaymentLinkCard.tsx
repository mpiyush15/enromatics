"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Loader, Mail, RefreshCw, ExternalLink } from "lucide-react";

interface PaymentSession {
  _id: string;
  sessionId: string;
  planName: string;
  billingCycle: string;
  amount: number;
  email: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
}

export default function PaymentLinkCard({ tenantId }: { tenantId: string }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sessions, setSessions] = useState<PaymentSession[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        console.log("📊 Fetching subscription plans from /api/subscription-plans/public...");
        
        // Use the public subscription plans endpoint that returns database plans
        const res = await fetch("/api/subscription-plans/public");

        console.log("📊 Plans API response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Plans API error response:", errorText.substring(0, 200));
          throw new Error(`Failed to fetch plans: ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ Plans fetched successfully:", data);

        if (data.success && data.plans && data.plans.length > 0) {
          // Map database plans to expected format
          const formattedPlans = data.plans.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            priceMonthly: plan.monthlyPrice || 0,
            priceAnnual: plan.annualPrice || 0,
          }));

          setPlans(formattedPlans);
          if (formattedPlans.length > 0) {
            setSelectedPlan(formattedPlans[0].id);
          }
          console.log("✅ Formatted plans:", formattedPlans);
        } else {
          setError("No active plans available");
        }
      } catch (err: any) {
        console.error("❌ Error fetching plans:", err);
        setError(err.message || "Failed to load available plans");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  // Fetch payment sessions for this tenant
  useEffect(() => {
    fetchSessions();
  }, [tenantId]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch(`/api/payment-links/tenant/${tenantId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/payment-links/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          planId: selectedPlan,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setGeneratedLink(data.paymentLink);
        setRecipientEmail(data.email);
        setSuccess(`✅ Payment link generated for ${data.plan} plan`);
        await fetchSessions();
      } else {
        console.error("❌ Backend error response:", data);
        setError(data.message || "Failed to generate payment link");
      }
    } catch (err: any) {
      console.error("❌ Frontend error:", err);
      setError(err.message || "Error generating payment link");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedLink) {
      setError("No payment link generated yet");
      return;
    }

    if (!recipientEmail) {
      setError("Email address is required");
      return;
    }

    setSendingEmail(true);
    setError("");

    try {
      const res = await fetch("/api/payment-links/send-email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: generatedLink.split("session=")[1],
          recipientEmail,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(`✅ Payment link sent to ${recipientEmail}`);
        setGeneratedLink("");
      } else {
        setError(data.message || "Failed to send email");
      }
    } catch (err: any) {
      setError(err.message || "Error sending email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSelectedPlan = () => plans.find((p) => p.id === selectedPlan);
  const plan = getSelectedPlan();
  const amount = billingCycle === "monthly" ? plan?.priceMonthly : plan?.priceAnnual;
  
  // Helper function to format amount - handle numbers, "Free", "Custom", etc.
  const formatAmount = (value: any) => {
    if (typeof value === 'number') {
      return `₹${value.toLocaleString()}`;
    }
    return String(value) || 'Contact Sales';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        🔗 Payment Link
      </h2>

      <div className="space-y-4">
        {/* Error Alert if Plans Failed to Load */}
        {error && !generatedLink && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {/* Generate Link Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Generate Payment Link
          </h3>

          <div className="space-y-4">
            {/* Plan Selection - Loading State */}
            {loadingPlans ? (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Select Plan
                </label>
                <div className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Loading available plans...
                </div>
              </div>
            ) : plans.length === 0 ? (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Select Plan
                </label>
                <div className="w-full px-3 py-3 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                  ❌ No plans available
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Select Plan
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  disabled={loading || plans.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Billing Cycle Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Billing Cycle
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="monthly"
                    checked={billingCycle === "monthly"}
                    onChange={(e) => setBillingCycle(e.target.value as "monthly" | "annual")}
                    disabled={loading}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Monthly (₹{plan?.priceMonthly || 0})
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="annual"
                    checked={billingCycle === "annual"}
                    onChange={(e) => setBillingCycle(e.target.value as "monthly" | "annual")}
                    disabled={loading}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Annual (₹{plan?.priceAnnual || 0}) <span className="text-green-600 font-semibold">30% OFF</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Amount Preview */}
            {amount !== undefined && (
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Amount ({billingCycle === "monthly" ? "Monthly" : "Annual"})
                </p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(amount)}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerateLink}
              disabled={loading || !selectedPlan || loadingPlans}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : loadingPlans ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Loading plans...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Generate Payment Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Link Display */}
        {generatedLink && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              ✅ Link Generated
            </h3>

            {/* Link Display */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded border border-green-300 dark:border-green-700 mb-3 flex items-center justify-between gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white font-mono truncate outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Copy link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>

            {/* Email Input & Send */}
            <div className="space-y-3">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />

              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !recipientEmail}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {sendingEmail ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </button>

              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Test Link
              </a>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Previous Payment Sessions */}
        {sessions.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              📋 Payment History ({sessions.length})
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map((session) => {
                const isExpired = new Date(session.expiresAt) < new Date();
                const isPending = session.status === "pending";

                return (
                  <div
                    key={session._id}
                    className={`p-3 rounded border ${
                      isExpired
                        ? "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.planName}{" "}
                          <span className="text-xs font-normal text-gray-600 dark:text-gray-400">
                            ({session.billingCycle})
                          </span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          ₹{session.amount.toLocaleString()} •{" "}
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              isPending
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                                : session.status === "success"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                            }`}
                          >
                            {session.status}
                          </span>
                          {isExpired && (
                            <span className="text-xs text-red-600 dark:text-red-400">Expired</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loadingSessions && (
          <div className="flex items-center justify-center py-4">
            <Loader className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}
