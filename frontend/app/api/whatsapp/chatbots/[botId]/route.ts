import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

interface RouteParams {
  params: {
    botId: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { tenantId } = body
    const { botId } = params

    if (!tenantId || !botId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID and Bot ID are required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/whatsapp/chatbots/${botId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Chatbot updated successfully",
      chatbot: data.chatbot,
    })
  } catch (error) {
    console.error("❌ Error updating chatbot:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { tenantId } = body
    const { botId } = params

    if (!tenantId || !botId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID and Bot ID are required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/whatsapp/chatbots/${botId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenantId }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Chatbot deleted successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting chatbot:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
