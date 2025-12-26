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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            💰 Plans Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update plan pricing and manage visibility on the public /plans page
          </p>
        </div>

        {/* Plans List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : plans.length === 0 ? (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">No plans found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan._id}
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 transition-all ${
                    plan.status === "active"
                      ? "border-green-500 dark:border-green-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                        <CardDescription className="text-base">{plan.description}</CardDescription>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleVisibility(plan)}
                          className={`p-2 rounded-lg transition-colors ${
                            plan.isVisible
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                          }`}
                          title={plan.isVisible ? "Hide from /plans page" : "Show on /plans page"}
                        >
                          {plan.isVisible ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                        </button>
                        {plan.status === "active" && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              Active
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Quotas Display */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-center">
                        <Users className="h-5 w-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Students</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {plan.quotas.students}
                        </p>
                      </div>
                      <div className="text-center">
                        <Users className="h-5 w-5 mx-auto mb-1 text-indigo-600 dark:text-indigo-400" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Staff</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {plan.quotas.staff}
                        </p>
                      </div>
                      <div className="text-center">
                        <HardDrive className="h-5 w-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Storage</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {plan.quotas.storage}
                        </p>
                      </div>
                    </div>

                    {/* Pricing Section - EDITABLE */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Update Pricing
                      </h3>
                      <div className="space-y-3">
                        {/* Monthly Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Monthly Price (₹)
                          </label>
                          <div className="flex gap-2">
                            <Input
                              value={editingPrices[plan._id]?.monthlyPrice || ""}
                              onChange={(e) =>
                                handlePriceChange(plan._id, "monthlyPrice", e.target.value)
                              }
                              placeholder="e.g., 999 or Free or Custom"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        {/* Annual Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Annual Price (₹)
                          </label>
                          <div className="flex gap-2">
                            <Input
                              value={editingPrices[plan._id]?.annualPrice || ""}
                              onChange={(e) =>
                                handlePriceChange(plan._id, "annualPrice", e.target.value)
                              }
                              placeholder="e.g., 8399 or Free or Custom"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        {/* Current Pricing Display */}
                        <div className="grid grid-cols-2 gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Current Monthly</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400">₹{plan.monthlyPrice}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Current Annual</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400">₹{plan.annualPrice}</p>
                          </div>
                        </div>

                        {/* Save Button */}
                        <Button
                          onClick={() => handleSavePrice(plan)}
                          disabled={savingPlanId === plan._id}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          {savingPlanId === plan._id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Update Pricing
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Features Section - EDITABLE */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <List className="h-5 w-5 text-purple-600" />
                        Manage Features
                      </h3>
                      
                      {/* Features List with Toggles */}
                      <div className="space-y-2 mb-3">
                        {editingFeatures[plan._id]?.length > 0 ? (
                          editingFeatures[plan._id].map((feature, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                            >
                              <label className="flex items-center gap-2 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={feature.enabled}
                                  onChange={() => handleFeatureToggle(plan._id, feature.name)}
                                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className={`text-sm ${feature.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                                  {feature.name}
                                </span>
                              </label>
                              <button
                                onClick={() => handleRemoveFeature(plan._id, feature.name)}
                                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                title="Remove feature"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No features added yet</p>
                        )}
                      </div>

                      {/* Add New Feature */}
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={newFeature[plan._id] || ""}
                          onChange={(e) => setNewFeature(prev => ({ ...prev, [plan._id]: e.target.value }))}
                          placeholder="Add new feature..."
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddFeature(plan._id)}
                        />
                        <Button
                          onClick={() => handleAddFeature(plan._id)}
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Save Features Button */}
                      <Button
                        onClick={() => handleSaveFeatures(plan)}
                        disabled={savingFeaturesId === plan._id}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {savingFeaturesId === plan._id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Features
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Info */}
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-800 dark:text-green-300">
                      <p>
                        <strong>✅ Available:</strong> Update pricing, manage features, toggle visibility.
                        <br />
                        <strong>Coming soon:</strong> Offers & promotions system.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
