// /app/api/subscribe/register/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password, plan } = await req.json();

    const client = await clientPromise;
    const db = client.db("forteStudioz");

    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
      role: "subscriber",
      subscribed: true,
      plan,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}