import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Dynamic import to avoid build-time issues
    const { getAllChatbots } = await import("@/lib/db")

    const chatbots = await getAllChatbots()
    return NextResponse.json(chatbots)
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return NextResponse.json({ error: "Failed to fetch chatbots" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Dynamic import to avoid build-time issues
    const { createChatbot } = await import("@/lib/db")

    const chatbot = await createChatbot(body)
    return NextResponse.json(chatbot, { status: 201 })
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return NextResponse.json({ error: "Failed to create chatbot" }, { status: 500 })
  }
}
