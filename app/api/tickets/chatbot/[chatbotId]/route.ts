import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// This route is for the admin panel to fetch all tickets for a specific chatbot
export async function GET(request: Request, { params }: { params: { chatbotId: string } }) {
  const { chatbotId } = params

  if (!chatbotId || isNaN(Number(chatbotId))) {
    return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400 })
  }

  try {
    const tickets = await sql`
      SELECT 
        id, 
        name,
        email,
        phone,
        subject, 
        message, 
        status, 
        priority, 
        created_at, 
        updated_at,
        user_ip, 
        image_url
      FROM tickets
      WHERE chatbot_id = ${chatbotId}
      ORDER BY created_at DESC
    `
    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Failed to fetch tickets for chatbot:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
