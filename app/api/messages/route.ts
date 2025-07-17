import { type NextRequest, NextResponse } from "next/server"
import { getChatbotMessages, saveMessage } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbotId")

    if (!chatbotId || isNaN(Number.parseInt(chatbotId))) {
      return NextResponse.json({ error: "Valid chatbot ID is required" }, { status: 400 })
    }

    const messages = await getChatbotMessages(Number.parseInt(chatbotId))
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatbot_id, user_message, bot_response, user_ip, user_agent } = body

    if (!chatbot_id || !user_message) {
      return NextResponse.json({ error: "chatbot_id and user_message are required" }, { status: 400 })
    }

    const messageId = await saveMessage({
      chatbot_id: Number.parseInt(chatbot_id),
      user_message,
      bot_response: bot_response || null,
      user_ip: user_ip || null,
      user_agent: user_agent || null,
    })

    return NextResponse.json({ id: messageId, message: "Message saved successfully" })
  } catch (error) {
    console.error("Error saving message:", error)
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}
