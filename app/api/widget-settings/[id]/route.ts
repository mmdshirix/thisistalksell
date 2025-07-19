import { NextResponse } from "next/server"
import { getChatbotById } from "@/lib/db"
import { unstable_noStore as noStore } from "next/cache"

// Opt out of caching to ensure fresh data is always served.
export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  noStore() // Ensure dynamic computation on each request

  try {
    const id = Number(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid Chatbot ID" }, { status: 400 })
    }

    const chatbot = await getChatbotById(id)

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Only return public-safe settings needed for the widget loader
    const settings = {
      id: chatbot.id,
      name: chatbot.name,
      position: chatbot.position,
      margin_x: chatbot.margin_x,
      margin_y: chatbot.margin_y,
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching widget settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
