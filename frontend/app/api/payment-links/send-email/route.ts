import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, recipientEmail } = body;

    if (!sessionId || !recipientEmail) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("[BFF] 📧 Sending payment link email:", {
      sessionId: sessionId.substring(0, 8) + "...",
      recipientEmail,
    });

    // Call backend send email
    const response = await fetch(`${BACKEND_URL}/api/payment-links/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Pixels-BFF/1.0",
        "Cookie": request.headers.get("cookie") || "",
        ...(request.headers.get("authorization") && {
          "Authorization": request.headers.get("authorization") || "",
        }),
      },
      body: JSON.stringify({
        sessionId,
        recipientEmail,
      }),
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

    console.log("[BFF] ✅ Payment link email sent successfully");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error sending email:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to send email",
      },
      { status: 500 }
    );
  }
}
