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

    const plan = {
      _id: planData.id,
      name: planData.name,
      description: planData.description,
      price: planData.monthlyPrice,
      annualPrice: planData.annualPrice,
      billingCycle: "monthly",
      features: planData.features.map(f => f.replace('✓ ', '')),
      maxStudents: planData.id === 'starter' ? 100 : planData.id === 'professional' ? 500 : 10000,
      maxStaff: planData.id === 'starter' ? 5 : planData.id === 'professional' ? 50 : 500,
      popular: planData.popular,
      buttonLabel: planData.buttonLabel,
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
