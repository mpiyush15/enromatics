import { NextRequest, NextResponse } from "next/server";
import { subscriptionPlans } from "@/data/plans";

// GET /api/subscription/plans/[planId] - Get a specific plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    // Find the plan from static data
    const planData = subscriptionPlans.find(p => p.id === planId);

    if (!planData) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    // Detect if plan is free (trial or free plans have price as "Free" string or 0)
    const isFree = planData.id === 'trial' || 
                   planData.id === 'free' || 
                   planData.monthlyPrice === "Free" || 
                   planData.monthlyPrice === 0;
    
    // Set numeric price for free plans
    const price = isFree ? 0 : planData.monthlyPrice;
    const annualPrice = isFree ? 0 : planData.annualPrice;

    const plan = {
      _id: planData.id,
      name: planData.name,
      description: planData.description,
      price: price,
      annualPrice: annualPrice,
      billingCycle: "monthly",
      features: planData.features.map(f => f.replace('✓ ', '')),
      maxStudents: planData.quotas?.students || 100,
      maxStaff: planData.quotas?.staff || 5,
      quotas: planData.quotas,
      popular: planData.popular,
      buttonLabel: planData.buttonLabel,
      isFree: isFree, // Explicitly set isFree flag
    };

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Get plan error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}
