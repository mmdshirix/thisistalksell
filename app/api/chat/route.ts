import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatbot_id } = body

    if (!message || !chatbot_id) {
      return NextResponse.json(
        {
          success: false,
          message: "پیام و شناسه چت‌بات الزامی است",
        },
        { status: 400 },
      )
    }

    // Simple echo response for now
    const botResponse = `شما گفتید: ${message}`

    // Save message to database
    const { saveMessage } = await import("@/lib/db")
    await saveMessage({
      chatbot_id: Number.parseInt(chatbot_id),
      user_message: message,
      bot_response: botResponse,
      user_ip: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json({
      success: true,
      response: botResponse,
    })
  } catch (error) {
    console.error("Error processing chat:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در پردازش پیام: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
