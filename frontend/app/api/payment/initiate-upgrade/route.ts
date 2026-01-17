import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * PUBLIC API ROUTE - No authentication required
 * 
 * This endpoint is called from the public payment checkout page
 * which is accessed via a public payment link (no login needed)
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

    console.log("💳 Creating Cashfree payment session for:", {
      sessionId,
      amount,
      email,
      planName,
    });

    // Check if Cashfree credentials are set
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_SECRET_KEY;
    
    if (!clientId || !clientSecret) {
      console.error("❌ Cashfree credentials not configured");
      return NextResponse.json(
        { success: false, message: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Call Cashfree API v3 to create payment session
    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: `order_${sessionId.substring(0, 12)}_${Date.now()}`,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: `tenant_${sessionId.substring(0, 12)}`,
          customer_email: email,
          customer_name: planName,
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}/upgrade/status`,
          notify_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}/api/payment/webhook`,
        },
        order_note: `${planName} - ${billingCycle} billing - Session: ${sessionId}`,
      }),
    });

    const responseText = await response.text();
    console.log("📋 Cashfree response status:", response.status);
    console.log("📋 Cashfree response body:", responseText.substring(0, 200));

    // Try to parse as JSON
    let cashfreeData;
    try {
      cashfreeData = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Failed to parse Cashfree response as JSON");
      console.error("Response was:", responseText.substring(0, 500));
      throw new Error(`Invalid Cashfree response: ${response.status} - ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      console.error("❌ Cashfree API error:", cashfreeData);
      throw new Error(cashfreeData.message || "Cashfree API error");
    }

    console.log("✅ Cashfree payment session created:", {
      orderId: cashfreeData.order_id,
      paymentSessionId: cashfreeData.payment_session_id,
    });

    return NextResponse.json({
      success: true,
      paymentSessionId: cashfreeData.payment_session_id,
      orderId: cashfreeData.order_id,
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
