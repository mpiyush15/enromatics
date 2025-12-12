import { NextRequest, NextResponse } from "next/server";
import { extractJWT } from "@/lib/jwt-utils";

export async function GET(request: NextRequest) {
  try {
    // Get JWT from Authorization header or cookies
    const token = extractJWT(request);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No JWT found" },
        { status: 401 }
      );
    }

    // -------------------------------
    // 2. Backend URL validation
    // -------------------------------
    const BASE = process.env.EXPRESS_BACKEND_URL;

    if (!BASE) {
      console.error("❌ EXPRESS_BACKEND_URL missing in env");
      return NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 }
      );
    }

    const backendUrl = `${BASE}/api/analytics/dashboard`;

    console.log("🔧 Fetching backend analytics:", backendUrl);

    // -------------------------------
    // 3. Forward request to backend
    // -------------------------------
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    // -------------------------------
    // 4. Forward backend response
    // -------------------------------
    if (!response.ok) {
      console.error("❌ Backend returned error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log("✅ Analytics success");
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ BFF Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
