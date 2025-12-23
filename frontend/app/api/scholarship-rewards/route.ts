import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

// GET /api/scholarship-rewards - List all rewards
export async function GET(request: NextRequest) {
  try {
    const headers = await buildBFFHeaders();
    const searchParams = request.nextUrl.searchParams;
    
    // Build query string from search params
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/scholarship-rewards${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in scholarship rewards BFF:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}

// POST /api/scholarship-rewards - Create new reward
export async function POST(request: NextRequest) {
  try {
    const headers = await buildBFFHeaders();
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/scholarship-rewards`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in scholarship rewards create BFF:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create reward" },
      { status: 500 }
    );
  }
}
