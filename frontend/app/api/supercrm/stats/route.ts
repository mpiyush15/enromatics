import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * GET /api/supercrm/stats - Get SuperCRM dashboard stats
 */
export async function GET(request: NextRequest) {
  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/supercrm/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch stats" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("SuperCRM stats API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
