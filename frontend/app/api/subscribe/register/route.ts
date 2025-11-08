
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { hash } from "bcryptjs";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const { username, email, business } = await req.json();

  const client = await clientPromise;
  const db = client.db("forteStudioz");

  const existingUser = await db.collection("users").findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "Email already exists, please login." }, { status: 400 });
  }

  const hashedPassword = await hash("default123", 10); // or auto-generate and email

  const tenantId = new ObjectId();

  await db.collection("users").insertOne({
    username,
    email,
    password: hashedPassword,
    role: "subscriber",
    subscribed: true,
    plan: "free",
    business,
    tenantId,
    createdAt: new Date(),
    

  });
  console.log("New user registered:", { username, email, business, tenantId });

  return NextResponse.json({ success: true });
}