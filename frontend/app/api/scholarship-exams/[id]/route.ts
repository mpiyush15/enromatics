import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookie = request.cookies.get("token");

    const response = await fetch(`${BACKEND_URL}/api/scholarship-exams/${params.id}`, {
      method: "GET",
      headers: {
        Cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching exam:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const cookie = request.cookies.get("token");

    const response = await fetch(`${BACKEND_URL}/api/scholarship-exams/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error updating exam:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookie = request.cookies.get("token");

    const response = await fetch(`${BACKEND_URL}/api/scholarship-exams/${params.id}`, {
      method: "DELETE",
      headers: {
        Cookie: cookie ? `${cookie.name}=${cookie.value}` : "",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting exam:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
