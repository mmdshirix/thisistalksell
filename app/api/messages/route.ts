import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: Request) {
  const sql = getSql()
  const { searchParams } = new URL(request.url)
  const chatbotId = searchParams.get("chatbotId")
  const limit = Number.parseInt(searchParams.get("limit") || "100", 10)
  const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

  if (!chatbotId) {
    return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400 })
  }

  try {
    const messages = await sql`
      SELECT id, chatbot_id, user_message, bot_response, created_at
      FROM messages
      WHERE chatbot_id = ${chatbotId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
