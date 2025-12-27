import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, name, instituteName, email, phone, isNewTenant, tenantId, billingCycle, amount } = body;

    console.log("Checkout request body:", JSON.stringify(body, null, 2));

    if (!planId || !email || !name) {
      return NextResponse.json(
        { error: "Plan ID, email, and name are required" },
        { status: 400 }
      );
    }

    // Call backend to initiate subscription payment
    const response = await fetch(`${BACKEND_URL}/api/payments/initiate-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId,
        name,
        instituteName,
        email,
        phone,
        isNewTenant,
        tenantId,
        billingCycle: billingCycle || "monthly", // ✅ Pass billing cycle (monthly/annual)
        amount: amount || undefined,              // ✅ Pass calculated amount
      }),
    });

    const data = await response.json();
    console.log("Backend response:", response.status, JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Failed to initiate payment" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to initiate checkout" },
      { status: 500 }
    );
  }
}
