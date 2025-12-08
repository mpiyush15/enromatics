"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
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
  Star
} from "lucide-react";
import { toast } from "sonner";

interface SubscriptionInfo {
  plan: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  trialStartDate: string | null;
  billingCycle: string;
  amount: number;
  currency: string;
  daysRemaining: number;
  isTrialActive: boolean;
}

interface TenantInfo {
  instituteName: string;
  email: string;
  plan: string;
  subscription: SubscriptionInfo;
}

interface UpgradePlan {
  _id: string;
  planId: string;
  name: string;
  description: string;
  price: number;
  annualPrice?: number;
  features: string[];
  popular?: boolean;
}

export default function MySubscriptionPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [upgradePlans, setUpgradePlans] = useState<UpgradePlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/subscription`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setTenant(data.tenant);
      } else {
        toast.error("Failed to load subscription details");
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const fetchUpgradePlans = useCallback(async () => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/upgrade-plans`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success && data.upgradePlans) {
        setUpgradePlans(data.upgradePlans);
      }
    } catch (error) {
      console.error("Error fetching upgrade plans:", error);
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) {
      fetchSubscription();
      fetchUpgradePlans();
    }
  }, [tenantId, fetchSubscription, fetchUpgradePlans]);

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
        fetchSubscription(); // Refresh
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
    setUpgradingPlan(planId);
    try {
      const response = await fetch(`/api/tenants/${tenantId}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId, billingCycle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate upgrade");
      }

      if (data.isFree) {
        toast.success("Plan upgraded successfully!");
        fetchSubscription();
        fetchUpgradePlans();
        return;
      }

      // Open Cashfree checkout for paid plans
      const cashfree = await (window as any).Cashfree({
        mode: "production",
      });

      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error: any) {
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
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Subscription</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your subscription plan and billing
        </p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Current Plan
              </CardTitle>
              <CardDescription className="mt-1">
                {tenant?.instituteName}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge className={`text-sm px-3 py-1 ${getPlanBadgeColor(tenant?.plan || "free")}`}>
                {(tenant?.plan || "free").toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status and Trial Info */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <CheckCircle className="h-4 w-4" />
                Status
              </div>
              <div className="font-semibold">
                {getStatusBadge(subscription?.status || "inactive")}
              </div>
            </div>

            {isTrialOrFree && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-1">
                  <Clock className="h-4 w-4" />
                  Trial Days Remaining
                </div>
                <div className={`font-bold text-2xl ${daysRemaining <= 3 ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
                  {daysRemaining > 0 ? daysRemaining : 0} days
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Calendar className="h-4 w-4" />
                {isTrialOrFree ? "Trial Started" : "Start Date"}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatDate(subscription?.trialStartDate ?? subscription?.startDate ?? null)}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <Calendar className="h-4 w-4" />
                {isTrialOrFree ? "Trial Ends" : "Renewal Date"}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatDate(subscription?.endDate ?? null)}
              </div>
            </div>
          </div>

          {/* Trial Warning */}
          {isTrialOrFree && daysRemaining <= 5 && daysRemaining > 0 && (
            <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  Your trial ends in {daysRemaining} days
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Upgrade now to continue using all features without interruption.
                </p>
              </div>
              <Button 
                className="ml-auto bg-yellow-600 hover:bg-yellow-700"
                onClick={() => document.getElementById("upgrade-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Upgrade Now
              </Button>
            </div>
          )}

          {/* Trial Expired Warning */}
          {isTrialOrFree && daysRemaining <= 0 && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  Your trial has expired
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Upgrade to a paid plan to regain full access.
                </p>
              </div>
              <Button 
                className="ml-auto bg-red-600 hover:bg-red-700"
                onClick={() => document.getElementById("upgrade-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Upgrade Now
              </Button>
            </div>
          )}

          {/* Billing Info for Paid Plans */}
          {!isTrialOrFree && subscription?.amount && subscription.amount > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                <CreditCard className="h-4 w-4" />
                Billing Information
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ₹{subscription.amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Billing Cycle</p>
                  <p className="font-semibold capitalize text-gray-900 dark:text-white">
                    {subscription.billingCycle || "Monthly"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next Billing</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(subscription.endDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
          {subscription?.status !== "cancelled" && !isTrialOrFree && (
            <Button 
              variant="destructive" 
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel Subscription
            </Button>
          )}
          {(isTrialOrFree || subscription?.status === "cancelled") && <div />}
        </CardFooter>
      </Card>

      {/* Upgrade Plans Section */}
      {upgradePlans.length > 0 && (
        <div id="upgrade-section" className="space-y-4 scroll-mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ArrowUpCircle className="h-6 w-6 text-blue-600" />
                Upgrade Your Plan
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Unlock more features by upgrading to a higher plan
              </p>
            </div>
            {/* Billing Cycle Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "yearly"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Yearly
                <Badge className="ml-2 bg-green-500 text-white text-xs">Save 20%</Badge>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upgradePlans.map((plan) => {
              const planId = plan.planId || plan._id;
              const price = billingCycle === "yearly" && plan.annualPrice 
                ? plan.annualPrice 
                : plan.price;
              const isUpgrading = upgradingPlan === planId;

              return (
                <Card 
                  key={planId} 
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    plan.popular 
                      ? "border-2 border-blue-500 dark:border-blue-400" 
                      : "border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      <Star className="h-3 w-3 inline mr-1" />
                      POPULAR
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Zap className={`h-5 w-5 ${plan.popular ? "text-blue-500" : "text-gray-400"}`} />
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {typeof price === "number" ? `₹${price.toLocaleString("en-IN")}` : price}
                      </span>
                      {typeof price === "number" && (
                        <span className="text-gray-500 dark:text-gray-400">
                          /{billingCycle === "yearly" ? "year" : "month"}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {plan.features?.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features && plan.features.length > 5 && (
                        <li className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                          +{plan.features.length - 5} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => handleUpgrade(planId)}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowUpCircle className="h-4 w-4 mr-2" />
                          Upgrade to {plan.name}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Cancel Subscription?
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Are you sure you want to cancel your subscription? You will lose access to all features at the end of your billing period.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Subscription
              </Button>
              <Button 
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={cancelling}
              >
                {cancelling ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cancelling...</>
                ) : (
                  "Yes, Cancel"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}