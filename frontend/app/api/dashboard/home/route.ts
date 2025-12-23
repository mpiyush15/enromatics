import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

/**
 * 🔒 BFF Route: GET /api/dashboard/home (STABILIZED)
 * 
 * Part of: stabilization/ssot-bff
 * Date: 21 Dec 2025
 * 
 * Fetches SuperAdmin dashboard analytics including:
 * - Total revenue, subscriptions, tenants, users
 * - Growth rates
 * - Charts data (plans, status, trends)
 * 
 * Features:
 * - ✅ Forwards auth cookies to Express backend
 * - ✅ Single source of truth (backend only)
 * - ✅ No caching (per stabilization rules)
 * - ✅ Clean error handling
 */

export async function GET(request: NextRequest) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://endearing-blessing-production-c61f.up.railway.app";
    
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // Extract cookies from incoming request
    const cookies = request.headers.get("cookie") || "";

    if (!cookies) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Call Express backend with cookies
    const response = await fetch(
      `${BACKEND_URL}/api/analytics/dashboard`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies,
        },
      }
    );

    const data = await response.json();

    // If successful, return the data
    if (response.ok) {
      return NextResponse.json(data);
    }

    // If unauthorized, return 401
    if (response.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For other errors
    return NextResponse.json(
      data || { error: "Failed to fetch analytics" },
      { status: response.status }
    );
  } catch (error) {
    console.error("[BFF] Dashboard Home Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
