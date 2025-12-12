import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    let token = request.cookies.get("token")?.value;

    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log("❌ No token provided");
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    const BASE = process.env.EXPRESS_BACKEND_URL;

    if (!BASE) {
      console.error("❌ EXPRESS_BACKEND_URL missing in env");
      return NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") || "10";

    const backendUrl = `${BASE}/api/analytics/top-tenants?limit=${limit}`;

    console.log("🔧 Fetching backend top tenants:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Backend returned error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log("✅ Top tenants success");
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ BFF Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
