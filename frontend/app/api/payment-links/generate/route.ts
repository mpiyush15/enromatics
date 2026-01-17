import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, planId, billingCycle } = body;

    if (!tenantId || !planId || !billingCycle) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("[BFF] 🔗 Generating payment link:", {
      tenantId,
      planId,
      billingCycle,
    });

    // Call backend payment link generation
    const response = await fetch(`${BACKEND_URL}/api/payment-links/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Pixels-BFF/1.0",
        // Forward cookies from the client request
        "Cookie": request.headers.get("cookie") || "",
        // Forward auth token if available
        ...(request.headers.get("authorization") && {
          "Authorization": request.headers.get("authorization") || "",
        }),
      },
      body: JSON.stringify({
        tenantId,
        planId,
        billingCycle,
      }),
    });

    const responseText = await response.text();
    console.log("[BFF] 📋 Backend response status:", response.status);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("[BFF] ❌ Backend returned invalid JSON");
      console.error("[BFF] Response was:", responseText.substring(0, 500));
      return NextResponse.json(
        {
          success: false,
          message: `Backend error: Invalid response format`,
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error("[BFF] ❌ Backend error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log("[BFF] ✅ Payment link generated successfully");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error generating payment link:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to generate payment link",
      },
      { status: 500 }
    );
  }
}
