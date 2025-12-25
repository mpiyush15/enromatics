import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

// GET /api/scholarship-results - Get all scholarship results
export async function GET(request: NextRequest) {
  try {
    const headers = await buildBFFHeaders();
    const searchParams = request.nextUrl.searchParams;
    
    // Build query string from search params (includes examId filter if provided)
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/scholarship-results${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in scholarship results BFF:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch scholarship results" },
      { status: 500 }
    );
  }
}
