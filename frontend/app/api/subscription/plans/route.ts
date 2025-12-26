import { NextResponse } from "next/server";

// Use environment variable for backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.EXPRESS_BACKEND_URL || "http://localhost:5050";

// GET /api/subscription/plans - Get all subscription plans from database
export async function GET() {
  try {
    console.log("[Subscription Plans BFF] Fetching all plans from:", BACKEND_URL);

    // Fetch from database via public API
    const res = await fetch(`${BACKEND_URL}/api/subscription-plans/public/all`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store", // Always get fresh data
    });

    if (!res.ok) {
      console.error("[Subscription Plans BFF] Backend error:", res.status);
      return NextResponse.json(
        { error: "Failed to fetch plans from database" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const dbPlans = data.plans || [];

    // Helper to get feature text
    const getFeatureText = (feature: any): string => {
      if (typeof feature === 'string') return feature.replace('✓ ', '');
      if (feature && typeof feature === 'object' && feature.name) return feature.name.replace('✓ ', '');
      return '';
    };

    // Transform to expected format
    const plans = dbPlans.map((plan: any) => {
      // Filter only enabled features
      const enabledFeatures = (plan.features || [])
        .filter((f: any) => typeof f === 'string' || (f && f.enabled !== false))
        .map(getFeatureText)
        .filter(Boolean);

      return {
        _id: plan._id || plan.id,
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.monthlyPrice,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        billingCycle: "monthly",
        features: enabledFeatures,
        maxStudents: plan.quotas?.students || 100,
        maxStaff: plan.quotas?.staff || 5,
        quotas: plan.quotas,
        popular: plan.popular,
        buttonLabel: plan.buttonLabel,
        isFree: plan.id === 'trial' || plan.monthlyPrice === "Free" || plan.monthlyPrice === 0,
      };
    });

    console.log("[Subscription Plans BFF] Returning", plans.length, "plans");

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("[Subscription Plans BFF] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
