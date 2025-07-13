import { type NextRequest, NextResponse } from "next/server"
import { saveMessage } from "@/lib/db"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatbot_id, user_message, bot_response } = body

    if (!chatbot_id || !user_message) {
      return NextResponse.json({ error: "داده‌های ناقص" }, { status: 400 })
    }

    // Get user IP and agent from headers for more reliability
    const headersList = headers()
    const user_ip = (headersList.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0].trim()
    const user_agent = headersList.get("user-agent") ?? "Unknown"

    const messageId = await saveMessage({
      chatbot_id: Number(chatbot_id),
      user_message,
      bot_response: bot_response || null,
      user_ip,
      user_agent,
    })

    return NextResponse.json({ messageId }, { status: 201 })
  } catch (error) {
    console.error("Error saving message:", error)
    return NextResponse.json({ error: "خطا در ذخیره پیام" }, { status: 500 })
  }
}
