import { NextResponse } from "next/server";
import { subscriptionPlans } from "@/data/plans";

// GET /api/subscription/plans - Get all subscription plans
export async function GET() {
  try {
    // Return the plans from the static data file
    const plans = subscriptionPlans.map(plan => ({
      _id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      billingCycle: "monthly",
      features: plan.features.map(f => f.replace('✓ ', '')),
      maxStudents: plan.id === 'starter' ? 100 : plan.id === 'professional' ? 500 : 10000,
      maxStaff: plan.id === 'starter' ? 5 : plan.id === 'professional' ? 50 : 500,
      popular: plan.popular,
      buttonLabel: plan.buttonLabel,
    }));

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
