import { type NextRequest, NextResponse } from "next/server"
import { deleteChatbot } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const success = await deleteChatbot(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete chatbot" }, { status: 500 })
    }

    return NextResponse.json({ message: "Chatbot deleted successfully" })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json({ error: "Failed to delete chatbot" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return DELETE(request, { params })
}
