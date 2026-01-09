import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

interface RouteParams {
  params: {
    botId: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { tenantId, keyword, templateId, customResponse } = body
    const { botId } = params

    if (!tenantId || !botId || !keyword) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/whatsapp/chatbots/${botId}/keywords`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          keyword,
          templateId,
          customResponse,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Keyword added successfully",
      chatbot: data.chatbot,
    })
  } catch (error) {
    console.error("❌ Error adding keyword:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tenantId = request.nextUrl.searchParams.get("tenantId")
    const { botId } = params

    if (!tenantId || !botId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID and Bot ID are required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/whatsapp/chatbots/${botId}/templates?tenantId=${tenantId}`,
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
      templates: data.templates || [],
    })
  } catch (error) {
    console.error("❌ Error fetching templates:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
