import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const tenantId = params.tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID is required" },
        { status: 400 }
      );
    }

    console.log("[BFF] 📋 Fetching payment sessions for tenant:", tenantId);

    // Call backend to get tenant sessions
    const response = await fetch(`${BACKEND_URL}/api/payment-links/tenant/${tenantId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Pixels-BFF/1.0",
        "Cookie": request.headers.get("cookie") || "",
        ...(request.headers.get("authorization") && {
          "Authorization": request.headers.get("authorization") || "",
        }),
      },
    });

    const responseText = await response.text();
    console.log("[BFF] 📋 Backend response status:", response.status);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("[BFF] ❌ Backend returned invalid JSON");
      console.error("[BFF] Response was:", responseText.substring(0, 500));
      return NextResponse.json(
        { success: false, message: "Backend error" },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error("[BFF] ❌ Backend error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log("[BFF] ✅ Payment sessions fetched:", data.sessions?.length || 0);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error fetching sessions:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch sessions",
      },
      { status: 500 }
    );
  }
}
