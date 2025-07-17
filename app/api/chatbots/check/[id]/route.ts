import { type NextRequest, NextResponse } from "next/server"
import { getChatbot } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID", exists: false }, { status: 400 })
    }

    const chatbot = await getChatbot(id)

    return NextResponse.json({
      exists: !!chatbot,
      chatbot: chatbot || null,
    })
  } catch (error) {
    console.error("Error checking chatbot:", error)
    return NextResponse.json({ error: "Failed to check chatbot", exists: false }, { status: 500 })
  }
}
