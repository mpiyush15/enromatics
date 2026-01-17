import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID is required" },
        { status: 400 }
      );
    }

    console.log("[BFF] 🔍 Fetching payment session:", sessionId.substring(0, 8) + "...");

    // Call backend to get session details (public endpoint)
    const response = await fetch(
      `${BACKEND_URL}/api/payment-links/session/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Pixels-BFF/1.0",
        },
      }
    );

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

    console.log("[BFF] ✅ Payment session fetched");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error fetching session:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch session",
      },
      { status: 500 }
    );
  }
}
