import "dotenv/config"
import { type NextRequest, NextResponse } from "next/server"
import { getChatbots, createChatbot } from "@/lib/db"

export async function GET() {
  try {
    const chatbots = await getChatbots()
    return NextResponse.json(chatbots)
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return NextResponse.json({ error: "Failed to fetch chatbots" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const chatbotData = {
      name: data.name,
      welcome_message: data.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
      navigation_message: data.navigation_message || "چه چیزی شما را به اینجا آورده است؟",
      primary_color: data.primary_color || "#14b8a6",
      text_color: data.text_color || "#ffffff",
      background_color: data.background_color || "#f3f4f6",
      chat_icon: data.chat_icon || "💬",
      position: data.position || "bottom-right",
      margin_x: data.margin_x || 20,
      margin_y: data.margin_y || 20,
      deepseek_api_key: data.deepseek_api_key || null,
      knowledge_base_text: data.knowledge_base_text || null,
      knowledge_base_url: data.knowledge_base_url || null,
      store_url: data.store_url || null,
      ai_url: data.ai_url || null,
      stats_multiplier: data.stats_multiplier || 1.0,
      enable_product_suggestions: data.enable_product_suggestions ?? true,
      enable_next_suggestions: data.enable_next_suggestions ?? true,
      prompt_template: data.prompt_template || null,
    }

    const newChatbot = await createChatbot(chatbotData)
    return NextResponse.json(newChatbot, { status: 201 })
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return NextResponse.json({ error: "Failed to create chatbot", details: String(error) }, { status: 500 })
  }
}
