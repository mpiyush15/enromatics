import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, cf_payment_id } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Verifying payment for order:", orderId);

    // Verify payment with Cashfree v3 API
    const response = await fetch(
      `https://api.cashfree.com/pg/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": process.env.CASHFREE_CLIENT_ID || "",
          "x-client-secret": process.env.CASHFREE_SECRET_KEY || "",
          "Content-Type": "application/json",
        },
      }
    );

    const responseText = await response.text();
    console.log("📋 Cashfree verify response status:", response.status);

    let orderData;
    try {
      orderData = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Failed to parse verify response:", responseText.substring(0, 300));
      throw new Error(`Invalid Cashfree response: ${response.status}`);
    }

    console.log("✅ Order data from Cashfree:", {
      orderId: orderData.order_id,
      status: orderData.order_status,
      amount: orderData.order_amount,
    });

    if (orderData.order_status === "PAID") {
      // Update subscription in backend
      console.log("💰 Payment confirmed - updating subscription...");
      
      const updateResponse = await fetch(`${BACKEND_URL}/api/payment/webhook/cashfree`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.order_id,
          status: "PAID",
          transactionId: cf_payment_id,
          amount: orderData.order_amount,
        }),
      });

      const updateData = await updateResponse.json();
      console.log("📊 Backend subscription update response:", updateData);

      if (updateData.success) {
        return NextResponse.json({
          success: true,
          message: "Payment verified and subscription updated successfully",
          details: {
            orderId: orderData.order_id,
            status: orderData.order_status,
            amount: orderData.order_amount,
            planName: orderData.order_note?.split(" - ")[0] || "Premium Plan",
            billingCycle: orderData.order_note?.split(" - ")[1] || "monthly",
          },
        });
      } else {
        console.warn("⚠️ Backend update failed but payment was confirmed");
        // Still return success as payment is confirmed
        return NextResponse.json({
          success: true,
          message: "Payment verified successfully",
          details: {
            orderId: orderData.order_id,
            status: orderData.order_status,
            amount: orderData.order_amount,
          },
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: `Payment status: ${orderData.order_status}. Payment not yet confirmed.`,
      details: {
        orderId: orderData.order_id,
        status: orderData.order_status,
      },
    });
  } catch (error: any) {
    console.error("❌ Payment verification error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Payment verification failed",
      },
      { status: 500 }
    );
  }
}
