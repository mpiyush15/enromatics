import { NextResponse } from "next/server";
import { buildBFFHeaders } from "@/lib/bffHelpers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/employees`, {
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/api/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
