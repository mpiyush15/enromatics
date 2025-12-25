import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";
const FETCH_TIMEOUT = 15000; // 15 second timeout

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
    console.log("[BFF] 🔍 Fetching all transactions from:", `${BACKEND_URL}/api/accounts/transactions`);

    // Get cookies from request headers (same as overview route)
    const cookies = request.headers.get('cookie') || '';
    
    console.log("[BFF] Cookies present:", !!cookies);

    const response = await fetchWithTimeout(
      `${BACKEND_URL}/api/accounts/transactions`,
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

    console.log("[BFF] Transactions response:", {
      status: response.status,
      success: data.success,
      count: data.transactions?.length || 0,
      total: data.total || 0,
    });

    if (!response.ok) {
      console.error("[BFF] ❌ Backend error:", {
        status: response.status,
        message: data.message,
        url: `${BACKEND_URL}/api/accounts/transactions`
      });
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || "Failed to fetch transactions from backend",
          error: `Backend returned ${response.status}`
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF] ❌ Error fetching transactions:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      backendUrl: BACKEND_URL
    });

    // Provide better error messages for different failure types
    let errorMessage = "Failed to fetch transactions";
    let statusCode = 500;

    if (error.name === 'AbortError') {
      errorMessage = "Request timeout - backend server took too long to respond";
      statusCode = 504;
    } else if (error.message?.includes('fetch failed')) {
      errorMessage = "Network error - cannot reach backend server. Please check server status.";
      statusCode = 503;
    } else if (error.message?.includes('ECONNREFUSED')) {
      errorMessage = "Backend server is not running";
      statusCode = 503;
    }

    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        details: error.message,
        backendUrl: BACKEND_URL
      },
      { status: statusCode }
    );
  }
}
