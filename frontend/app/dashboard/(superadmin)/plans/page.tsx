"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  DollarSign,
  Users,
  HardDrive,
  Eye,
  EyeOff,
  CheckCircle,
  List,
  Plus,
  X,
} from "lucide-react";

// Import unified types - SINGLE SOURCE OF TRUTH
import { 
  SubscriptionPlan, 
  FeatureItem,
  PlansApiResponse,
  PlanUpdateResponse,
  PlanUpdatePayload,
  normalizeFeatures,
  getFeatureText,
} from "@/types/subscription-plan";

interface EditingPrice {
  [key: string]: {
    monthlyPrice: string | number;
    annualPrice: string | number;
  };
}

interface EditingFeatures {
  [key: string]: FeatureItem[];
}

export default function PlansManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrices, setEditingPrices] = useState<EditingPrice>({});
  const [editingFeatures, setEditingFeatures] = useState<EditingFeatures>({});
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [savingFeaturesId, setSavingFeaturesId] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState<{[key: string]: string}>({});

  // Fetch plans from /api/subscription-plans
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subscription-plans");
      const data = await res.json();

      if (data.success) {
        setPlans(data.plans);
        // Initialize editing prices with current values
        const initPrices: EditingPrice = {};
        const initFeatures: EditingFeatures = {};
        data.plans.forEach((plan: SubscriptionPlan) => {
          initPrices[plan._id] = {
            monthlyPrice: plan.monthlyPrice,
            annualPrice: plan.annualPrice,
          };
          initFeatures[plan._id] = normalizeFeatures(plan.features);
        });
        setEditingPrices(initPrices);
        setEditingFeatures(initFeatures);
      } else {
        toast.error(data.message || "Failed to fetch plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (planId: string, field: "monthlyPrice" | "annualPrice", value: string) => {
    setEditingPrices(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [field]: value,
      }
    }));
  };

  const handleSavePrice = async (plan: SubscriptionPlan) => {
    try {
      setSavingPlanId(plan._id);
      const pricing = editingPrices[plan._id];
      
      const res = await fetch(`/api/subscription-plans/${plan._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyPrice: isNaN(Number(pricing.monthlyPrice)) ? pricing.monthlyPrice : Number(pricing.monthlyPrice),
          annualPrice: isNaN(Number(pricing.annualPrice)) ? pricing.annualPrice : Number(pricing.annualPrice),
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("✅ Plan pricing updated successfully");
        // Update local state
        setPlans(plans.map(p => p._id === plan._id ? data.plan : p));
        // Update editing prices
        setEditingPrices(prev => ({
          ...prev,
          [plan._id]: {
            monthlyPrice: data.plan.monthlyPrice,
            annualPrice: data.plan.annualPrice,
          }
        }));
      } else {
        toast.error(data.message || "Failed to update plan");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
    } finally {
      setSavingPlanId(null);
    }
  };

  const toggleVisibility = async (plan: SubscriptionPlan) => {
    try {
      const res = await fetch(`/api/subscription-plans/${plan._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isVisible: !plan.isVisible,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`✅ Plan ${!plan.isVisible ? "shown" : "hidden"} on /plans page`);
        setPlans(plans.map(p => p._id === plan._id ? data.plan : p));
      } else {
        toast.error(data.message || "Failed to toggle visibility");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to toggle visibility");
    }
  };

  // Toggle a feature on/off
  const handleFeatureToggle = (planId: string, featureName: string) => {
    setEditingFeatures(prev => ({
      ...prev,
      [planId]: prev[planId].map(f =>
        f.name === featureName ? { ...f, enabled: !f.enabled } : f
      )
    }));
  };

  // Add a new feature
  const handleAddFeature = (planId: string) => {
    const featureName = newFeature[planId]?.trim();
    if (!featureName) {
      toast.error("Enter a feature name");
      return;
    }
    
    // Check if already exists
    if (editingFeatures[planId]?.some(f => f.name.toLowerCase() === featureName.toLowerCase())) {
      toast.error("Feature already exists");
      return;
    }
    
    setEditingFeatures(prev => ({
      ...prev,
      [planId]: [...(prev[planId] || []), { name: featureName, enabled: true }]
    }));
    setNewFeature(prev => ({ ...prev, [planId]: "" }));
  };

  // Remove a feature
  const handleRemoveFeature = (planId: string, featureName: string) => {
    setEditingFeatures(prev => ({
      ...prev,
      [planId]: prev[planId].filter(f => f.name !== featureName)
    }));
  };

  // Save features to backend
  const handleSaveFeatures = async (plan: SubscriptionPlan) => {
    try {
      setSavingFeaturesId(plan._id);
      const features = editingFeatures[plan._id];
      
      const res = await fetch(`/api/subscription-plans/${plan._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("✅ Features updated successfully");
        setPlans(plans.map(p => p._id === plan._id ? data.plan : p));
        // Update editing features with saved data
        setEditingFeatures(prev => ({
          ...prev,
          [plan._id]: normalizeFeatures(data.plan.features)
        }));
      } else {
        toast.error(data.message || "Failed to update features");
      }
    } catch (error) {
      console.error("Error updating features:", error);
      toast.error("Failed to update features");
    } finally {
      setSavingFeaturesId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-500 bg-clip-text text-transparent dark:from-purple-400 dark:via-cyan-300 dark:to-purple-400">
              Plans Management
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              Update pricing and features to all plans
            </p>
          </div>
        </div>

        {/* KPI Metrics */}
        {!loading && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Plans</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{plans.length}</h3>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Active Plans</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{plans.filter(p => p.status === 'active').length}</h3>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Visible Plans</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{plans.filter(p => p.isVisible).length}</h3>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Customers</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">950</h3>
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage subscription plans and pricing</h2>
        </div>

        {/* Plans Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : plans.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
              <CardContent className="py-12 text-center">
                <p className="text-slate-600 dark:text-slate-400">No plans found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 p-6 flex flex-col"
                >
                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🚀</div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                        {plan.status === "active" && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                            ✓ Active
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleVisibility(plan)}
                      className={`p-2 rounded-lg transition-all ${
                        plan.isVisible
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}
                      title={plan.isVisible ? "Hide from /plans page" : "Show on /plans page"}
                    >
                      {plan.isVisible ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Quotas Display */}
                  <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                    <div className="text-center">
                      <Users className="h-4 w-4 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                      <p className="text-xs text-slate-600 dark:text-slate-400">Students</p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {plan.quotas.students === Infinity ? "∞" : plan.quotas.students}
                      </p>
                    </div>
                    <div className="text-center">
                      <Users className="h-4 w-4 mx-auto mb-1 text-cyan-600 dark:text-cyan-400" />
                      <p className="text-xs text-slate-600 dark:text-slate-400">Staff</p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {plan.quotas.staff === Infinity ? "∞" : plan.quotas.staff}
                      </p>
                    </div>
                    <div className="text-center">
                      <HardDrive className="h-4 w-4 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                      <p className="text-xs text-slate-600 dark:text-slate-400">Storage</p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {plan.quotas.storage}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Monthly</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">₹{plan.monthlyPrice}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">/month</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Annual</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">₹{plan.annualPrice}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">/year</p>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-6 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      Features
                    </h4>
                    <div className="space-y-2">
                      {editingFeatures[plan._id]?.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${feature.enabled ? "bg-purple-600" : "bg-slate-300"}`}></div>
                          <span className={`text-sm ${feature.enabled ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600 line-through"}`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                      {editingFeatures[plan._id]?.length > 4 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">+{editingFeatures[plan._id].length - 4} more</p>
                      )}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 dark:from-purple-700 dark:to-cyan-700 text-white rounded-lg font-medium text-sm transition-all duration-200">
                    Manage Plan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Edit Modal/Section (hidden by default, shows on manage click) */}
        {/* This will be added for the detailed editor modal */}
      </div>
    </div>
  );
}
