"use client";

import { useState, useEffect } from "react";
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
  Sparkles
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

export default function MySubscriptionPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (tenantId) {
      fetchSubscription();
    }
  }, [tenantId]);

  const fetchSubscription = async () => {
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
  };

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
        return "bg-blue-100 text-blue-800";
      case "starter":
      case "basic":
        return "bg-green-100 text-green-800";
      case "professional":
      case "pro":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <h1 className="text-3xl font-bold">My Subscription</h1>
        <p className="text-gray-600 mt-1">
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
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <CheckCircle className="h-4 w-4" />
                Status
              </div>
              <div className="font-semibold">
                {getStatusBadge(subscription?.status || "inactive")}
              </div>
            </div>

            {isTrialOrFree && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                  <Clock className="h-4 w-4" />
                  Trial Days Remaining
                </div>
                <div className={`font-bold text-2xl ${daysRemaining <= 3 ? "text-red-600" : "text-blue-600"}`}>
                  {daysRemaining > 0 ? daysRemaining : 0} days
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                {isTrialOrFree ? "Trial Started" : "Start Date"}
              </div>
              <div className="font-semibold">
                {formatDate(subscription?.trialStartDate ?? subscription?.startDate ?? null)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                {isTrialOrFree ? "Trial Ends" : "Renewal Date"}
              </div>
              <div className="font-semibold">
                {formatDate(subscription?.endDate ?? null)}
              </div>
            </div>
          </div>

          {/* Trial Warning */}
          {isTrialOrFree && daysRemaining <= 5 && daysRemaining > 0 && (
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800">
                  Your trial ends in {daysRemaining} days
                </p>
                <p className="text-sm text-yellow-700">
                  Upgrade now to continue using all features without interruption.
                </p>
              </div>
              <Button className="ml-auto bg-yellow-600 hover:bg-yellow-700">
                Upgrade Now
              </Button>
            </div>
          )}

          {/* Trial Expired Warning */}
          {isTrialOrFree && daysRemaining <= 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">
                  Your trial has expired
                </p>
                <p className="text-sm text-red-700">
                  Upgrade to a paid plan to regain full access.
                </p>
              </div>
              <Button className="ml-auto bg-red-600 hover:bg-red-700">
                Upgrade Now
              </Button>
            </div>
          )}

          {/* Billing Info for Paid Plans */}
          {!isTrialOrFree && subscription?.amount && subscription.amount > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing Information
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold">
                    ₹{subscription.amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Billing Cycle</p>
                  <p className="font-semibold capitalize">
                    {subscription.billingCycle || "Monthly"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next Billing</p>
                  <p className="font-semibold">
                    {formatDate(subscription.endDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-4 flex justify-between">
          <Button variant="outline" asChild>
            <a href="/subscription/plans">View All Plans</a>
          </Button>
          
          {subscription?.status !== "cancelled" && (
            <Button 
              variant="destructive" 
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel Subscription
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Cancel Subscription?
              </CardTitle>
              <CardDescription>
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