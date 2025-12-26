import { NextRequest, NextResponse } from "next/server";

// Use environment variable for backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.EXPRESS_BACKEND_URL || "http://localhost:5050";

// GET /api/subscription/plans/[planId] - Get a specific plan from database
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    console.log("[Checkout BFF] Fetching plan:", planId, "from:", BACKEND_URL);

    // Fetch from database via public API (find by plan id like "basic", "pro", etc.)
    const res = await fetch(`${BACKEND_URL}/api/subscription-plans/public/all`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store", // Always get fresh data
    });

    if (!res.ok) {
      console.error("[Checkout BFF] Backend error:", res.status);
      return NextResponse.json(
        { error: "Failed to fetch plans from database" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const plans = data.plans || [];

    // Find plan by id field (e.g., "basic", "pro", "trial", "enterprise")
    const planData = plans.find((p: any) => p.id === planId);

    if (!planData) {
      console.log("[Checkout BFF] Plan not found:", planId, "Available:", plans.map((p: any) => p.id));
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    // Detect if plan is free
    const isFree = planData.id === 'trial' || 
                   planData.id === 'free' || 
                   planData.monthlyPrice === "Free" || 
                   planData.monthlyPrice === 0;

    // Helper to get feature text
    const getFeatureText = (feature: any): string => {
      if (typeof feature === 'string') return feature.replace('✓ ', '');
      if (feature && typeof feature === 'object' && feature.name) return feature.name.replace('✓ ', '');
      return '';
    };

    // Filter only enabled features
    const enabledFeatures = (planData.features || [])
      .filter((f: any) => typeof f === 'string' || (f && f.enabled !== false))
      .map(getFeatureText)
      .filter(Boolean);

    const plan = {
      _id: planData._id || planData.id,
      id: planData.id,
      name: planData.name,
      description: planData.description,
      monthlyPrice: planData.monthlyPrice,
      annualPrice: planData.annualPrice,
      price: isFree ? 0 : planData.monthlyPrice, // Legacy support
      billingCycle: "monthly",
      features: enabledFeatures,
      maxStudents: planData.quotas?.students || 100,
      maxStaff: planData.quotas?.staff || 5,
      quotas: planData.quotas,
      popular: planData.popular,
      buttonLabel: planData.buttonLabel,
      isFree: isFree,
    };

    console.log("[Checkout BFF] Plan found:", plan.name, "Monthly:", plan.monthlyPrice, "Annual:", plan.annualPrice);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("[Checkout BFF] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}
