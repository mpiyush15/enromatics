import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";
import crypto from "crypto";
export async function POST(req: Request) {
  const body = await req.json();
  const { username, email, password } = body;

  const client = await clientPromise;
  const db = client.db("forteStudioz");

  const userExists = await db.collection("users").findOne({ email });
  if (userExists) {
    return Response.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.collection("users").insertOne({
    username,
    email,
    password: hashedPassword,
    role: "user",
    plan: "free",
    subscribed: false,
    tenantId: crypto.randomBytes(8).toString("hex"), // 16-char unique tenant ID
    createdAt: new Date(),
  });

  return Response.json({ message: "User registered" }, { status: 201 });
}