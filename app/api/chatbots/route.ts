import { type NextRequest, NextResponse } from "next/server"
import { createChatbot, getAllChatbots } from "@/lib/db"

export async function GET() {
  try {
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

    const chatbot = await createChatbot({
      name: body.name || "چت‌بات جدید",
      welcome_message: body.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
      navigation_message: body.navigation_message || "چه چیزی شما را به اینجا آورده است؟",
      primary_color: body.primary_color || "#14b8a6",
      text_color: body.text_color || "#ffffff",
      background_color: body.background_color || "#f3f4f6",
      chat_icon: body.chat_icon || "💬",
      position: body.position || "bottom-right",
      margin_x: body.margin_x || 20,
      margin_y: body.margin_y || 20,
      deepseek_api_key: body.deepseek_api_key || null,
      knowledge_base_text: body.knowledge_base_text || null,
      knowledge_base_url: body.knowledge_base_url || null,
      store_url: body.store_url || null,
      ai_url: body.ai_url || null,
      stats_multiplier: body.stats_multiplier || 1.0,
    })

    return NextResponse.json(chatbot, { status: 201 })
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return NextResponse.json({ error: "Failed to create chatbot" }, { status: 500 })
  }
}
