import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const batch = searchParams.get("batch");

    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        message: "startDate and endDate are required"
      }, { status: 400 });
    }

    // Get auth headers and cookies from request
    const authHeader = request.headers.get("authorization");
    const cookies = request.headers.get("cookie");

    const headers: any = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    if (cookies) {
      headers["Cookie"] = cookies;
    }

    // Build query string for backend
    const queryParams = new URLSearchParams();
    queryParams.append("startDate", startDate);
    queryParams.append("endDate", endDate);
    if (batch) queryParams.append("batch", batch);

    // Call backend API
    const backendUrl = `${BACKEND_URL}/api/attendance/analytics?${queryParams.toString()}`;

    console.log(`📊 Fetching attendance analytics from: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`❌ Backend error [${response.status}]:`, response.statusText);
      
      return NextResponse.json({
        success: false,
        message: `Backend error: ${response.statusText}`
      }, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ Analytics data fetched successfully from backend");

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("❌ Attendance analytics error:", error.message);
    
    return NextResponse.json({
      success: false,
      message: "Server error",
      error: error.message
    }, { status: 500 });
  }
}
