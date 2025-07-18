import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatbotId } = body

    if (!message || !chatbotId) {
      return NextResponse.json({ success: false, message: "پیام و شناسه چت‌بات الزامی است" }, { status: 400 })
    }

    // Simple echo response for now
    // In production, you would integrate with DeepSeek API here
    const response = `شما گفتید: "${message}". این یک پاسخ نمونه است.`

    // Save message to database
    const { saveChatMessage } = await import("@/lib/db")
    const userIp = request.headers.get("x-forwarded-for") || "unknown"

    await saveChatMessage(Number.parseInt(chatbotId), message, response, userIp)

    return NextResponse.json({
      success: true,
      response: response,
    })
  } catch (error) {
    console.error("Error processing chat message:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در پردازش پیام: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
