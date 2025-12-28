import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * GET /api/analytics/stats - Get analytics stats (SuperAdmin only)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;

    if (!token) {
      console.warn("❌ No JWT token found in cookies");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ JWT token found, fetching analytics stats");

    const backendResponse = await fetch(`${BACKEND_URL}/api/website-analytics/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await backendResponse.json();
    
    if (!backendResponse.ok) {
      console.error("❌ Backend error:", backendResponse.status, data);
    } else {
      console.log("✅ Analytics stats fetched successfully");
    }
    
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error: any) {
    console.error("Analytics stats error:", error.message);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
