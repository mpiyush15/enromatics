import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || "https://endearing-blessing-production-c61f.up.railway.app";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json().catch(() => ({ resetPassword: true }));

    const response = await fetch(`${BACKEND_URL}/api/tenants/${tenantId}/send-credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `token=${token}`,
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
