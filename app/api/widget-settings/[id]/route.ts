import { type NextRequest, NextResponse } from "next/server"
import { getChatbot } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const chatbot = await getChatbot(id)

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Return only the settings needed for the widget
    const widgetSettings = {
      id: chatbot.id,
      name: chatbot.name,
      welcome_message: chatbot.welcome_message,
      navigation_message: chatbot.navigation_message,
      primary_color: chatbot.primary_color,
      text_color: chatbot.text_color,
      background_color: chatbot.background_color,
      chat_icon: chatbot.chat_icon,
      position: chatbot.position,
      margin_x: chatbot.margin_x,
      margin_y: chatbot.margin_y,
    }

    return NextResponse.json(widgetSettings)
  } catch (error) {
    console.error("Error fetching widget settings:", error)
    return NextResponse.json({ error: "Failed to fetch widget settings" }, { status: 500 })
  }
}
