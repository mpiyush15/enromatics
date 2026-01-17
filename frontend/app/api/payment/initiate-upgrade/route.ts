import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * PUBLIC API ROUTE - No authentication required
 * 
 * This endpoint proxies to the backend payment initiation endpoint
 * Backend handles Cashfree credentials securely
 * 
 * Security: Validated via sessionId which is tied to a specific tenant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, amount, email, planName, billingCycle } = body;

    if (!sessionId || !amount || !email) {
      console.error("❌ Missing required fields:", { sessionId, amount, email });
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("💳 Creating Cashfree payment session via backend for:", {
      sessionId,
      amount,
      email,
      planName,
    });

    // Call backend payment link initiation endpoint
    // Backend will handle Cashfree API calls with its own credentials
    const response = await fetch(`${BACKEND_URL}/api/payment-links/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
      }),
    });

    const responseText = await response.text();
    console.log("📋 Backend response status:", response.status);
    console.log("📋 Backend response body:", responseText.substring(0, 200));

    // Try to parse as JSON
    let backendData;
    try {
      backendData = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Failed to parse backend response as JSON");
      console.error("Response was:", responseText.substring(0, 500));
      throw new Error(`Invalid backend response: ${response.status} - ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      console.error("❌ Backend API error:", backendData);
      throw new Error(backendData.message || "Backend API error");
    }

    console.log("✅ Payment session created via backend:", {
      orderId: backendData.order_id,
      paymentSessionId: backendData.payment_session_id,
    });

    return NextResponse.json({
      success: true,
      paymentSessionId: backendData.payment_session_id,
      orderId: backendData.order_id,
      message: "Payment session created successfully",
    });
  } catch (error: any) {
    console.error("❌ Error creating payment session:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create payment session",
      },
      { status: 500 }
    );
  }
}
