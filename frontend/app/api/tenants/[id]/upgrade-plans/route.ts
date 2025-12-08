import { NextRequest, NextResponse } from "next/server";
import { subscriptionPlans } from "@/data/plans";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

// Plan hierarchy for upgrade logic
const PLAN_HIERARCHY = ["trial", "free", "basic", "pro", "enterprise"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    
    // Get cookies from request headers (same as other working routes)
    const cookieHeader = request.headers.get("cookie") || "";
    
    // Extract token from cookie header
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current tenant subscription info
    const tenantResponse = await fetch(`${BACKEND_URL}/api/tenants/${tenantId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Cookie: cookieHeader,
      },
    });

    if (!tenantResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tenant info" },
        { status: tenantResponse.status }
      );
    }

    const tenantData = await tenantResponse.json();
    const currentPlan = (tenantData.tenant?.plan || "trial").toLowerCase();

    // Get current plan index
    const currentPlanIndex = PLAN_HIERARCHY.indexOf(currentPlan);
    
    // Filter to show only plans higher than current plan (exclude trial, only paid plans)
    const upgradePlans = subscriptionPlans
      .filter((plan) => {
        const planIndex = PLAN_HIERARCHY.indexOf(plan.id.toLowerCase());
        // Show plans that are higher in hierarchy and are not trial/free
        return planIndex > currentPlanIndex && plan.id !== "trial";
      })
      .map((plan) => ({
        _id: plan.id,
        planId: plan.id,
        name: plan.name,
        description: plan.description,
        price: typeof plan.monthlyPrice === "number" ? plan.monthlyPrice : 0,
        annualPrice: typeof plan.annualPrice === "number" ? plan.annualPrice : 0,
        features: plan.features,
        popular: plan.popular || false,
        quotas: plan.quotas,
      }));

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
