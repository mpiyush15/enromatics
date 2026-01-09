import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get("tenantId")

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID is required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/whatsapp/chatbots?tenantId=${tenantId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      chatbots: data.chatbots || [],
      count: data.count || 0,
    })
  } catch (error) {
    console.error("❌ Error fetching chatbots:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, botName, description, welcomeTemplateId } = body

    if (!tenantId || !botName) {
      return NextResponse.json(
        { success: false, message: "Tenant ID and bot name are required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/whatsapp/chatbots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenantId,
        botName,
        description,
        welcomeTemplateId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Chatbot created successfully",
      chatbot: data.chatbot,
    })
  } catch (error) {
    console.error("❌ Error creating chatbot:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
