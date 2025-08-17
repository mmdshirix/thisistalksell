import { type NextRequest, NextResponse } from "next/server"
import { saveMessage } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatbot_id, user_message, bot_response, user_ip, user_agent } = body

    if (!chatbot_id || !user_message) {
      return NextResponse.json({ error: "chatbot_id and user_message are required" }, { status: 400 })
    }

    // ذخیره پیام در دیتابیس
    const messageId = await saveMessage({
      chatbot_id: Number(chatbot_id),
      user_message,
      bot_response: bot_response || null,
      user_ip: user_ip || null,
      user_agent: user_agent || null,
    })

    return NextResponse.json({
      success: true,
      message_id: messageId,
      message: "پیام با موفقیت ذخیره شد",
    })
  } catch (error) {
    console.error("Error saving message:", error)
    return NextResponse.json({ error: "خطا در ذخیره پیام", details: error }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Messages API is working",
    endpoints: {
      POST: "Save a new message",
      "GET /api/chatbots/[id]/stats/messages": "Get message count for chatbot",
    },
  })
}
