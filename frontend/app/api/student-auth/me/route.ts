import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    const response = await fetch(`${backendUrl}/api/student-auth/me`, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("BFF /api/student-auth/me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student data" },
      { status: 500 }
    );
  }
}
