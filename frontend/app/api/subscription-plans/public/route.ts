import { NextRequest, NextResponse } from "next/server";

// Use environment variable, fallback to localhost for development
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.EXPRESS_BACKEND_URL || "http://localhost:5050";
const FETCH_TIMEOUT = 15000;

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// GET /api/subscription-plans/public - Get all visible, active plans (no auth required)
export async function GET(request: NextRequest) {
  try {
    console.log("[BFF] 🔍 Fetching public subscription plans from:", `${BACKEND_URL}/api/subscription-plans/public/all`);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/subscription-plans/public/all`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Pixels-BFF/1.0",
        },
      },
      FETCH_TIMEOUT
    );

    if (!response.ok) {
      console.error("[BFF] ❌ Backend returned error:", response.status);
      return NextResponse.json(
        { success: false, message: "Failed to fetch plans" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[BFF] ✅ Public plans fetched:", data.plans?.length || 0, "plans");

    return NextResponse.json(data);
  } catch (error) {
    console.error("[BFF] ❌ Error fetching public plans:", error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, message: "Request timeout" },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
