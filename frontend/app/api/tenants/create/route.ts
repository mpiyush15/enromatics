import { NextRequest, NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";
import { cookies } from "next/headers";

/**
 * POST /api/tenants/create
 * BFF route to create a new tenant (superadmin only)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Get cookies for authentication
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("token")?.value;

    if (!authCookie) {
      return NextResponse.json(
        { message: "Unauthorized - No authentication token" },
        { status: 401 }
      );
    }

    // Forward request to Express backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const response = await fetch(`${backendUrl}/api/tenants/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${authCookie}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Tenant creation error:", error);
    return NextResponse.json(
      { message: "Failed to create tenant" },
      { status: 500 }
    );
  }
}
