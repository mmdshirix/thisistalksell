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

    if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
      return NextResponse.json({ error: "نام چت‌بات الزامی است" }, { status: 400 })
    }

    const chatbotData = {
      name: data.name.trim(),
      welcomeMessage: data.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
      navigationMessage: data.navigation_message || "چه چیزی شما را به اینجا آورده است؟",
      primaryColor: data.primary_color || "#14b8a6",
      textColor: data.text_color || "#ffffff",
      backgroundColor: data.background_color || "#f3f4f6",
      chatIcon: data.chat_icon || "💬",
      position: data.position || "bottom-right",
      marginX: data.margin_x || 20,
      marginY: data.margin_y || 20,
      deepseekApiKey: data.deepseek_api_key || null,
      knowledgeBaseText: data.knowledge_base_text || null,
      knowledgeBaseUrl: data.knowledge_base_url || null,
      storeUrl: data.store_url || null,
      aiUrl: data.ai_url || null,
      statsMultiplier: data.stats_multiplier || 1.0,
      enableProductSuggestions: data.enable_product_suggestions ?? true,
      enableNextSuggestions: data.enable_next_suggestions ?? true,
      promptTemplate: data.prompt_template || null,
    }

    const chatbot = await createChatbot(chatbotData)
    return NextResponse.json(chatbot, { status: 201 })
  } catch (error) {
    console.error("Error creating chatbot:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: "Failed to create chatbot", details: errorMessage }, { status: 500 })
  }
}
