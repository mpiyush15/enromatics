import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

// Plan hierarchy for upgrade logic
const PLAN_HIERARCHY = ["trial", "basic", "pro", "enterprise"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current tenant subscription info
    const tenantResponse = await fetch(`${BACKEND_URL}/api/tenants/${tenantId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!tenantResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tenant info" },
        { status: tenantResponse.status }
      );
    }

    const tenantData = await tenantResponse.json();
    const currentPlan = tenantData.tenant?.plan || "trial";

    // Get all available plans
    const plansResponse = await fetch(`${BACKEND_URL}/api/subscription/plans`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!plansResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch plans" },
        { status: plansResponse.status }
      );
    }

    const plansData = await plansResponse.json();
    const allPlans = plansData.plans || [];

    // Filter to show only plans higher than current plan
    const currentPlanIndex = PLAN_HIERARCHY.indexOf(currentPlan.toLowerCase());
    
    const upgradePlans = allPlans.filter((plan: any) => {
      const planId = plan.planId || plan.id || plan.name?.toLowerCase();
      const planIndex = PLAN_HIERARCHY.indexOf(planId?.toLowerCase());
      return planIndex > currentPlanIndex;
    });

    return NextResponse.json({
      success: true,
      currentPlan,
      upgradePlans,
      tenant: {
        id: tenantData.tenant?._id,
        instituteName: tenantData.tenant?.instituteName,
        email: tenantData.tenant?.email,
        phone: tenantData.tenant?.phone,
        adminName: tenantData.tenant?.adminName,
      },
    });
  } catch (error) {
    console.error("Error fetching upgrade plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch upgrade plans" },
      { status: 500 }
    );
  }
}
