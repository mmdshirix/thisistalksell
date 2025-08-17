import { type NextRequest, NextResponse } from "next/server"
import { getChatbotById } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const chatbot = await getChatbotById(chatbotId)

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Return widget settings
    const settings = {
      id: chatbot.id,
      name: chatbot.name,
      primary_color: chatbot.primary_color || "#0D9488",
      text_color: chatbot.text_color || "#FFFFFF",
      background_color: chatbot.background_color || "#F9FAFB",
      chat_icon: chatbot.chat_icon || "💬",
      position: chatbot.position || "bottom-right",
      margin_x: chatbot.margin_x || 20,
      margin_y: chatbot.margin_y || 20,
      welcome_message: chatbot.welcome_message,
      navigation_message: chatbot.navigation_message,
    }

    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching widget settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
