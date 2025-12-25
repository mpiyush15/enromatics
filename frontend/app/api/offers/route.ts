import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";
const FETCH_TIMEOUT = 20000; // 20 second timeout

// Helper function to fetch with timeout
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status');
    const isActive = searchParams.get('isActive');

    // Build query string
    let queryString = `?page=${page}&limit=${limit}`;
    if (status) queryString += `&status=${status}`;
    if (isActive) queryString += `&isActive=${isActive}`;

    const cookies = request.headers.get('cookie') || '';
    
    console.log("[BFF] 🔍 Fetching offers from:", `${BACKEND_URL}/api/offers${queryString}`);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/offers${queryString}`,
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

    console.log("[BFF] Offers response:", {
      status: response.status,
      success: data.success,
      count: data.offers?.length || 0,
    });

    if (!response.ok) {
      console.error("[BFF] ❌ Backend error:", {
        status: response.status,
        message: data.message,
      });
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || "Failed to fetch offers from backend",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error fetching offers:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch offers",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookies = request.headers.get('cookie') || '';

    console.log("[BFF] 📝 Creating offer:", body.name);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/offers`,
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
          message: data.message || "Failed to create offer",
        },
        { status: response.status }
      );
    }

    console.log("[BFF] ✅ Offer created successfully");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error creating offer:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to create offer",
      },
      { status: 500 }
    );
  }
}
