import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * POST /api/public/form-leads - Submit a public lead (no auth required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_URL}/api/form-leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to submit lead" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Public form leads API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
