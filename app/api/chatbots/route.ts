import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { getAllChatbots } = await import("@/lib/db")
    const chatbots = await getAllChatbots()

    return NextResponse.json({
      success: true,
      data: chatbots,
    })
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در دریافت چت‌بات‌ها: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { createChatbot } = await import("@/lib/db")
    const body = await request.json()

    const chatbot = await createChatbot({
      name: body.name || "چت‌بات جدید",
      description: body.description || "",
      website_url: body.website_url || "",
      primary_color: body.primary_color || "#3B82F6",
      secondary_color: body.secondary_color || "#1E40AF",
      welcome_message: body.welcome_message || "سلام! چطور می‌تونم کمکتون کنم؟",
      placeholder_text: body.placeholder_text || "پیام خود را بنویسید...",
      position: body.position || "bottom-right",
      size: body.size || "medium",
      stats_multiplier: body.stats_multiplier || 1,
    })

    return NextResponse.json({
      success: true,
      data: chatbot,
    })
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در ایجاد چت‌بات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
