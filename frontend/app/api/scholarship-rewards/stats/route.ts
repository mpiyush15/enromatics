import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

// GET /api/scholarship-rewards/stats - Get reward statistics
export async function GET(request: NextRequest) {
  try {
    // Headers now built with buildBFFHeaders() including subdomain
    const searchParams = request.nextUrl.searchParams;
    
    // Build query string from search params
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/scholarship-rewards/stats${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in scholarship rewards stats BFF:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reward statistics" },
      { status: 500 }
    );
  }
}
