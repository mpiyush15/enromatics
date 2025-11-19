import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ message: "Tenant ID is required" }, { status: 400 });
    }

    // Get auth cookie
    const cookie = request.cookies.get("jwt");

    const response = await fetch(`${BACKEND_URL}/api/scholarship-exams?tenantId=${tenantId}`, {
      method: "GET",
      headers: {
        Cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching exams:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

  // Get auth cookie
  const cookie = request.cookies.get("jwt");

    const response = await fetch(`${BACKEND_URL}/api/scholarship-exams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating exam:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
