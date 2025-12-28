import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * POST /api/analytics/track - Track page view (public, no auth)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📊 [BFF] Track request received:", body);

    // Forward to backend with visitor IP
    const forwardedFor = request.headers.get("x-forwarded-for") || "unknown";
    
    console.log("📊 [BFF] Forwarding to backend:", `${BACKEND_URL}/api/website-analytics/track`);
    
    const backendResponse = await fetch(`${BACKEND_URL}/api/website-analytics/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": forwardedFor,
        "user-agent": request.headers.get("user-agent") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();
    console.log(`📊 [BFF] Backend response (${backendResponse.status}):`, data);
    
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error: any) {
    // Silent fail for tracking - don't break user experience
    console.error("❌ [BFF] Analytics track error:", error.message);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
