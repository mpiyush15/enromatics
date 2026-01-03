import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * POST /api/analytics/track - Track page view (public, no auth)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if request has a body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('⚠️ Analytics track called without JSON body');
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Try to parse JSON body, handle empty body gracefully
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        console.warn('⚠️ Analytics track called with empty body');
        return NextResponse.json({ success: true }, { status: 200 });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ JSON parse error in analytics track:', parseError);
      return NextResponse.json({ success: true }, { status: 200 });
    }

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
