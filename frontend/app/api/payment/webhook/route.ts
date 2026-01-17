import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentSessionId, status, transactionId } = body;

    console.log("🔔 Payment webhook received:", {
      orderId,
      status,
      transactionId,
    });

    if (status === "PAID") {
      // Forward to backend for subscription update
      const response = await fetch(`${BACKEND_URL}/api/payment/webhook/cashfree`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentSessionId,
          status,
          transactionId,
        }),
      });

      const data = await response.json();

      console.log("✅ Payment webhook processed:", data);

      return NextResponse.json({
        success: true,
        message: "Webhook processed successfully",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Webhook received",
    });
  } catch (error: any) {
    console.error("❌ Webhook error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
