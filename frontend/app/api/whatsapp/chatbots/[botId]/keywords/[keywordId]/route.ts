import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

interface RouteParams {
  params: {
    botId: string
    keywordId: string
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { tenantId } = body
    const { botId, keywordId } = params

    if (!tenantId || !botId || !keywordId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/whatsapp/chatbots/${botId}/keywords/${keywordId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Keyword removed successfully",
      chatbot: data.chatbot,
    })
  } catch (error) {
    console.error("❌ Error deleting keyword:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
