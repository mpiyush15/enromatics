import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    
    // Get cookie header from request
    const cookieHeader = request.headers.get("cookie");

    // Check for jwt cookie (used by auth system)
    if (!cookieHeader || !cookieHeader.includes("jwt=")) {
      return NextResponse.json({ error: "Unauthorized - Please login again" }, { status: 401 });
    }

    // Get request body
    const body = await request.json().catch(() => ({ resetPassword: true }));

    const response = await fetch(`${BACKEND_URL}/api/tenants/${tenantId}/send-credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Failed to send credentials" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Send credentials error:", error);
    return NextResponse.json(
      { error: "Failed to send credentials" },
      { status: 500 }
    );
  }
}
