"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  Calendar,
  Loader2,
  XCircle,
  Sparkles,
  ArrowUpCircle,
  Zap,
  Star,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/lib/hooks/use-subscription";
// Import unified types - SINGLE SOURCE OF TRUTH for plans
import { 
  SubscriptionPlan, 
  PlansApiResponse,
  getFeatureText, 
  isFeatureEnabled,
} from "@/types/subscription-plan";

// Plan hierarchy for filtering
const PLAN_HIERARCHY = ["trial", "free", "basic", "pro", "enterprise"];

// SWR fetcher - no cache, always fresh data
const plansFetcher = async (url: string) => {
  const res = await fetch(url, { 
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
  });
  if (!res.ok) throw new Error('Failed to fetch plans');
  return res.json();
};

interface UpgradePlan {
  _id: string;
  planId: string;
  name: string;
  description: string;
  price: number;
  annualPrice?: number;
  features: string[];
  popular?: boolean;
  isContactSales?: boolean;
}

export default function MySubscriptionPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  
  // Use SWR for caching - data persists across navigation
  const { tenant, isLoading: loading, refresh: refreshSubscription } = useSubscription(tenantId);
  
  // Fetch dynamic plans from API (same as /plans page)
  const { data: plansData, error: plansError, isLoading: plansLoading, mutate: refreshPlans } = useSWR<PlansApiResponse>(
    '/api/subscription-plans/public',
    plansFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every 60 seconds
      dedupingInterval: 10000,
    }
  );
  
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  // Get available plans from API
  const availablePlans = useMemo(() => {
    return plansData?.plans?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) || [];
  }, [plansData]);

  // Get upgrade plans based on current plan (using dynamic API data)
  const upgradePlans = useMemo((): UpgradePlan[] => {
    const subscriptionStatus = tenant?.subscription?.status;
    
    // If subscription status is pending, treat as previous active plan (trial)
    let planLower = (tenant?.plan || "trial").toLowerCase();
    
    // If status is pending or inactive, user is still on trial
    if (subscriptionStatus === "pending" || subscriptionStatus === "inactive") {
      planLower = "trial";
    }
    
    const currentPlanIndex = PLAN_HIERARCHY.indexOf(planLower);
    
    return availablePlans
      .filter((plan: SubscriptionPlan) => {
        const planIndex = PLAN_HIERARCHY.indexOf(plan.id.toLowerCase());
        // Show plans that are higher in hierarchy and are not trial/free
        // Also exclude enterprise (Custom pricing - Contact Sales)
        return planIndex > currentPlanIndex && plan.id !== "trial" && plan.id !== "enterprise";
      })
      .map((plan: SubscriptionPlan) => ({
        _id: plan._id || plan.id,
        planId: plan.id,
        name: plan.name,
        description: plan.description,
        price: typeof plan.monthlyPrice === "number" ? plan.monthlyPrice : 0,
        annualPrice: typeof plan.annualPrice === "number" ? plan.annualPrice : 0,
        // Convert features to string array (handle both string and object format)
        features: plan.features
          .filter(isFeatureEnabled)
          .map(getFeatureText),
        popular: plan.popular || false,
        isContactSales: plan.monthlyPrice === "Custom",
      }));
  }, [tenant?.plan, tenant?.subscription?.status, availablePlans]);

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const response = await fetch(`/api/tenants/${tenantId}/subscription/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Subscription cancelled successfully");
        setShowCancelConfirm(false);
        refreshSubscription(); // Refresh via SWR
      } else {
        toast.error(data.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  // Load Cashfree SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleUpgrade = async (planId: string) => {
    console.log("handleUpgrade called with planId:", planId);
    console.log("tenantId:", tenantId);
    console.log("billingCycle:", billingCycle);
    
    // Validate required fields
    if (!tenantId) {
      toast.error("Tenant ID not found. Please refresh and try again.");
      return;
    }
    
    if (!planId) {
      toast.error("Plan ID not found. Please select a plan.");
      return;
    }

    // Get user data from tenant
    if (!tenant?.email || !tenant?.name) {
      toast.error("User information not loaded. Please refresh and try again.");
      return;
    }
    
    setUpgradingPlan(planId);
    try {
      // Normalize "yearly" to "annual" for backend compatibility
      const normalizedCycle = billingCycle === "yearly" ? "annual" : billingCycle;
      
      // Reuse the existing checkout endpoint - it handles both new signups and upgrades
      // Just pass tenantId so backend knows it's an upgrade, not a new signup
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          planId, 
          billingCycle: normalizedCycle,
          tenantId, // Pass this so backend knows it's an upgrade
          isNewTenant: false, // Mark as upgrade
          email: tenant.email, // Add email from tenant data
          name: tenant.name, // Add name from tenant data
          instituteName: tenant.instituteName || tenant.name, // Add institute name
          phone: tenant.contact?.phone || '9999999999', // Add phone from tenant data
        }),
      });

      const data = await response.json();
      console.log("Upgrade response:", data);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to initiate upgrade");
      }

      console.log("isFree:", data.isFree);
      console.log("paymentSessionId:", data.paymentSessionId);

      if (data.isFree) {
        toast.success("Plan upgraded successfully!");
        refreshSubscription(); // Refresh via SWR
        return;
      }

      // Check if paymentSessionId exists
      if (!data.paymentSessionId) {
        console.error("No paymentSessionId in response:", data);
        throw new Error("Payment session not created. Please try again.");
      }

      // Open Cashfree checkout for paid plans in a modal/popup
      console.log("Opening Cashfree checkout with sessionId:", data.paymentSessionId);
      const cashfree = await (window as any).Cashfree({
        mode: "production",
      });

      console.log("Cashfree initialized:", !!cashfree);

      // Use modal so user stays on same page and returns to dashboard
      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_modal", // Opens as popup modal, stays on same page
        onSuccess: (paymentData: any) => {
          console.log("Payment successful:", paymentData);
          toast.success("Payment successful! Updating subscription...");
          refreshSubscription(); // Refresh via SWR to show updated plan
        },
        onFailure: (error: any) => {
          console.log("Payment failed or cancelled:", error);
          toast.error("Payment was cancelled or failed. Please try again.");
        },
        onClose: () => {
          console.log("Payment modal closed");
          // User closed the modal - refresh to check if payment was made
          refreshSubscription();
        },
      });
    } catch (error: any) {
      console.error("Upgrade error:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      toast.error(error.message || "Failed to upgrade plan");
    } finally {
      setUpgradingPlan(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "trial":
      case "free":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "starter":
      case "basic":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "professional":
      case "pro":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "enterprise":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "trial":
        return <Badge className="bg-blue-500">Trial</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "trial":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      case "inactive":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const subscription = tenant?.subscription;
  const isTrialOrFree = tenant?.plan === "trial" || tenant?.plan === "free";
  const daysRemaining = subscription?.daysRemaining || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Subscription</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your plan and billing</p>
        </div>

        {/* Current Plan Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Plan Name */}
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Current Plan</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{(tenant?.plan || "Free").toUpperCase()}</p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(subscription?.status || "inactive")}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {subscription?.status || "Inactive"}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                {isTrialOrFree ? "Trial Ends" : "Renews"}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(subscription?.endDate ?? null) || "N/A"}
              </p>
            </div>

            {/* Trial Days (if applicable) */}
            {isTrialOrFree && daysRemaining > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Days Left</p>
                <p className={`text-2xl font-semibold ${daysRemaining <= 5 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                  {daysRemaining}
                </p>
              </div>
            )}
          </div>

          {/* Billing Info for Paid Plans */}
          {!isTrialOrFree && subscription?.amount && subscription.amount > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Amount</p>
                  <p className="font-semibold text-gray-900 dark:text-white">₹{subscription.amount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Billing Cycle</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">{subscription.billingCycle || "Monthly"}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Next Billing</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatDate(subscription.endDate)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trial Warning or Expired */}
        {isTrialOrFree && daysRemaining > 0 && daysRemaining <= 5 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mb-8">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Your trial ends in {daysRemaining} days. Upgrade now to avoid interruption.
            </p>
          </div>
        )}

        {isTrialOrFree && daysRemaining <= 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 mb-8">
            <p className="text-sm font-medium text-red-900 dark:text-red-200">
              Your trial has expired. Upgrade to a paid plan to regain access.
            </p>
          </div>
        )}

        {/* Upgrade Plans */}
        {upgradePlans.length > 0 && (
          <div id="upgrade-section" className="space-y-6">
            {/* 50% Off Annual Banner */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white shadow-lg border border-green-500/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">Save 50% with Annual Billing</h3>
                  <p className="text-sm text-green-100">Pay once a year and save half on your subscription</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-4xl font-bold">50%</div>
                  <div className="text-xs text-green-100">OFF</div>
                </div>
              </div>
            </div>

            {/* Header with Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Choose Your Plan</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select the plan that fits your needs</p>
              </div>
              {/* Billing Cycle Toggle */}
              <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                    billingCycle === "monthly"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                    billingCycle === "yearly"
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Annual
                </button>
              </div>
            </div>

            {/* Plans Grid with Enterprise Side */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Main Plans Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
              {upgradePlans.map((plan) => {
                const planId = plan.planId || plan._id;
                const price = billingCycle === "yearly" && plan.annualPrice 
                  ? plan.annualPrice 
                  : plan.price;
                const isUpgrading = upgradingPlan === planId;

                return (
                  <div 
                    key={planId} 
                    className={`border rounded-lg p-6 transition-all ${
                      plan.popular 
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{plan.description}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {typeof price === "number" ? `₹${price.toLocaleString("en-IN")}` : price}
                        </span>
                        {typeof price === "number" && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            /{billingCycle === "yearly" ? "year" : "mo"}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6 text-sm">
                      {plan.features?.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex gap-2 text-gray-700 dark:text-gray-300">
                          <span className="text-green-600 dark:text-green-400 font-medium">✓</span>
                          {feature}
                        </li>
                      ))}
                      {plan.features && plan.features.length > 4 && (
                        <li className="text-gray-500 dark:text-gray-400">+{plan.features.length - 4} more</li>
                      )}
                    </ul>

                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                      }`}
                      onClick={() => handleUpgrade(planId)}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing
                        </>
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  </div>
                );
              })}
                </div>
              </div>

              {/* Enterprise Section - Sidebar */}
              {tenant?.plan !== "enterprise" && (
                <div className="lg:col-span-1">
                  <div className="sticky top-6 border border-purple-300 dark:border-purple-700 rounded-lg p-6 bg-purple-50 dark:bg-purple-900/20">
                    <div className="text-center">
                      <div className="inline-block px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full mb-3">ENTERPRISE</div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Custom Plan</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Unlimited everything with dedicated support
                      </p>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">Custom Pricing</div>
                      <ul className="text-left space-y-2 mb-6 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex gap-2">
                          <span className="text-green-600 dark:text-green-400 font-medium">✓</span>
                          Unlimited students
                        </li>
                        <li className="flex gap-2">
                          <span className="text-green-600 dark:text-green-400 font-medium">✓</span>
                          Unlimited storage
                        </li>
                        <li className="flex gap-2">
                          <span className="text-green-600 dark:text-green-400 font-medium">✓</span>
                          White-label APK
                        </li>
                        <li className="flex gap-2">
                          <span className="text-green-600 dark:text-green-400 font-medium">✓</span>
                          24/7 support
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => {
                          window.open("mailto:support@enromatics.com?subject=Enterprise Plan Inquiry", "_blank");
                        }}
                      >
                        Contact Sales
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancel Subscription */}
        {!isTrialOrFree && subscription?.status !== "cancelled" && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline"
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel Subscription
            </Button>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cancel Subscription?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                You'll lose access at the end of your billing period.
              </p>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep It
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cancelling</>
                  ) : (
                    "Cancel"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}