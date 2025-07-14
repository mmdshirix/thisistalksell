import { NextResponse } from "next/server"
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, website_url, business_type } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const chatbot = await createChatbot({
      name,
      description,
      website_url,
      business_type,
    })

    return NextResponse.json(chatbot, { status: 201 })
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return NextResponse.json({ error: "Failed to create chatbot" }, { status: 500 })
  }
}
