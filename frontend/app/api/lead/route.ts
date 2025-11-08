import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { z } from "zod";

// Zod schema for validation
const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  institute: z.string().min(2),
  plan: z.string(), // "monthly" or "onetime"
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);
    if (!body) throw new Error("Empty body received");

    if (!parsed.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid input", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("forteStudioz");

    await db.collection("lead").insertOne({
      ...parsed.data,
      createdAt: new Date()
    });

    return NextResponse.json({ status: "success", message: "Lead saved!" });
  } catch (error) {
    console.error("Lead API Error:", error);
    return NextResponse.json({ status: "error", message: "Server error" }, { status: 500 });
  }
}