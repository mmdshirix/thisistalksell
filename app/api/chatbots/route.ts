import "dotenv/config"
import { type NextRequest, NextResponse } from "next/server"
import { createChatbot, getChatbots } from "@/lib/db"

export async function GET() {
  try {
    const chatbots = await getChatbots()
    return NextResponse.json(chatbots)
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return NextResponse.json({ error: "Failed to fetch chatbots", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Create chatbot data object that matches the createChatbot function signature
    const chatbotData = {
      name: data.name,
      description: data.description || "",
      website_url: data.website_url || "",
      business_type: data.business_type || "general",
      primary_color: data.primary_color || "#3B82F6",
      welcome_message: data.welcome_message || "سلام! چطور می‌تونم کمکتون کنم؟",
      placeholder_text: data.placeholder_text || "پیام خود را بنویسید...",
      position: data.position || "bottom-right",
      enable_product_suggestions: data.enable_product_suggestions || false,
      enable_faq: data.enable_faq || true,
      stats_multiplier: data.stats_multiplier || 1,
    }

    const newChatbot = await createChatbot(chatbotData)
    return NextResponse.json(newChatbot, { status: 201 })
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return NextResponse.json({ error: "Failed to create chatbot", details: String(error) }, { status: 500 })
  }
}
