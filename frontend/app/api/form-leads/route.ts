import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * GET /api/form-leads - Get all public form leads (SuperAdmin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const status = searchParams.get("status") || "";

    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("limit", limit);
    if (status) queryParams.append("status", status);

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/form-leads?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch leads" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Form leads API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
