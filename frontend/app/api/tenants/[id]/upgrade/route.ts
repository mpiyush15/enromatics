import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

export async function POST(
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
      console.log("No token found in cookies:", cookieHeader);
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, billingCycle = "monthly" } = body;
    
    console.log("Upgrade request - tenantId:", tenantId, "planId:", planId, "billingCycle:", billingCycle);

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    // Get tenant info for payment
    const tenantResponse = await fetch(`${BACKEND_URL}/api/tenants/${tenantId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Cookie: cookieHeader,
      },
    });

    if (!tenantResponse.ok) {
      console.log("Tenant fetch failed:", tenantResponse.status);
      return NextResponse.json(
        { error: "Failed to fetch tenant info" },
        { status: tenantResponse.status }
      );
    }

    const tenantData = await tenantResponse.json();
    const tenant = tenantData.tenant;
    console.log("Tenant found:", tenant?.email);

    // Call backend to initiate upgrade payment - tenant is already authenticated
    const response = await fetch(`${BACKEND_URL}/api/payments/initiate-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        planId,
        billingCycle,
        name: tenant.adminName || tenant.name,
        instituteName: tenant.instituteName,
        email: tenant.email,
        phone: tenant.phone,
        isNewTenant: false, // Existing tenant upgrading
        tenantId: tenant._id,
        isUpgrade: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Failed to initiate upgrade payment" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      paymentSessionId: data.paymentSessionId,
      orderId: data.orderId,
      isFree: data.isFree,
    });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: "Failed to initiate upgrade" },
      { status: 500 }
    );
  }
}
