import { type NextRequest, NextResponse } from "next/server"
import { getChatbots, createChatbot } from "@/lib/db"

export async function GET() {
  try {
    console.log("API: Getting all chatbots...")
    const chatbots = await getChatbots()
    console.log(`API: Found ${chatbots.length} chatbots`)
    return NextResponse.json(chatbots)
  } catch (error) {
    console.error("API Error fetching chatbots:", error)
    return NextResponse.json({ error: "Failed to fetch chatbots", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: Creating new chatbot...")
    const body = await request.json()
    console.log("API: Request body:", body)

    // اعتبارسنجی داده‌های ورودی
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      console.error("API: Invalid name provided:", body.name)
      return NextResponse.json({ error: "نام چت‌بات الزامی است" }, { status: 400 })
    }

    const chatbotData = {
      name: body.name.trim(),
      welcome_message: body.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
      navigation_message: body.navigation_message || "چه چیزی شما را به اینجا آورده است؟",
      primary_color: body.primary_color || "#14b8a6",
      text_color: body.text_color || "#ffffff",
      background_color: body.background_color || "#f3f4f6",
      chat_icon: body.chat_icon || "💬",
      position: body.position || "bottom-right",
      deepseek_api_key: body.deepseek_api_key || null,
      knowledge_base_text: body.knowledge_base_text || null,
      knowledge_base_url: body.knowledge_base_url || null,
      store_url: body.store_url || null,
      ai_url: body.ai_url || null,
      stats_multiplier: body.stats_multiplier || 1.0,
    }

    console.log("API: Creating chatbot with data:", chatbotData)
    const chatbot = await createChatbot(chatbotData)
    console.log("API: Chatbot created successfully:", chatbot)

    return NextResponse.json(chatbot, { status: 201 })
  } catch (error) {
    console.error("API Error creating chatbot:", error)
    return NextResponse.json({ error: "Failed to create chatbot", details: String(error) }, { status: 500 })
  }
}
