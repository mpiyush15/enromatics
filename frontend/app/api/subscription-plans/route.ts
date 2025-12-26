import { NextRequest, NextResponse } from "next/server";

// Use environment variable, fallback to localhost for development
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.EXPRESS_BACKEND_URL || "http://localhost:5050";
const FETCH_TIMEOUT = 20000;

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

// GET /api/subscription-plans - Get all plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status');
    const isVisible = searchParams.get('isVisible');

    let queryString = `?page=${page}&limit=${limit}`;
    if (status) queryString += `&status=${status}`;
    if (isVisible) queryString += `&isVisible=${isVisible}`;

    const cookies = request.headers.get('cookie') || '';

    console.log("[BFF] 🔍 Fetching subscription plans from:", `${BACKEND_URL}/api/subscription-plans${queryString}`);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/subscription-plans${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookies,
          "User-Agent": "Pixels-BFF/1.0",
        },
        credentials: "include",
      },
      FETCH_TIMEOUT
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[BFF] ❌ Backend error:", {
        status: response.status,
        message: data.message,
      });
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || "Failed to fetch subscription plans",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error fetching subscription plans:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch subscription plans",
      },
      { status: 500 }
    );
  }
}

// POST /api/subscription-plans - Create new plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';

    console.log("[BFF] 📝 Creating subscription plan:", body.name);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/subscription-plans`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookies,
          "User-Agent": "Pixels-BFF/1.0",
        },
        body: JSON.stringify(body),
        credentials: "include",
      },
      FETCH_TIMEOUT
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[BFF] ❌ Backend error:", {
        status: response.status,
        message: data.message,
      });
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || "Failed to create plan",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[BFF] ❌ Error creating plan:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to create plan",
      },
      { status: 500 }
    );
  }
}
