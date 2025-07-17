import { type NextRequest, NextResponse } from "next/server"
import { getChatbot, updateChatbot, deleteChatbot } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const chatbot = await getChatbot(id)

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    return NextResponse.json(chatbot)
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return NextResponse.json({ error: "Failed to fetch chatbot" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const body = await request.json()
    const chatbot = await updateChatbot(id, body)

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    return NextResponse.json(chatbot)
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json({ error: "Failed to update chatbot" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const chatbot = await deleteChatbot(id)

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Chatbot deleted successfully" })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json({ error: "Failed to delete chatbot" }, { status: 500 })
  }
}
