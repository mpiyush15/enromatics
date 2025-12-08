/**
 * BFF Tenant Subscription Route
 * GET /api/tenants/[id]/subscription - Get subscription details
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID is required" },
        { status: 400 }
      );
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/tenants/${tenantId}`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch subscription" },
        { status: response.status }
      );
    }

    // Calculate days remaining for trial
    const tenant = data.tenant || data;
    const subscription = tenant.subscription || {};
    
    let daysRemaining = 0;
    if (subscription.endDate) {
      const endDate = new Date(subscription.endDate);
      const now = new Date();
      daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    const isTrialActive = tenant.plan === "trial" && daysRemaining > 0;

    return NextResponse.json({
      success: true,
      tenant: {
        instituteName: tenant.instituteName,
        email: tenant.email,
        plan: tenant.plan || "free",
        subscription: {
          status: subscription.status || "inactive",
          startDate: subscription.startDate || null,
          endDate: subscription.endDate || null,
          trialStartDate: subscription.trialStartDate || null,
          billingCycle: subscription.billingCycle || "monthly",
          amount: subscription.amount || 0,
          currency: subscription.currency || "INR",
          daysRemaining,
          isTrialActive,
        },
      },
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}
