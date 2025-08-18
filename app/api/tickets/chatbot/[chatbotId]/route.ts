import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { chatbotId: string } }) {
  try {
    const chatbotId = params.chatbotId

    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400 })
    }

    // Get all tickets for this chatbot with response counts
    const tickets = await sql`
      SELECT 
        t.id,
        t.name,
        t.phone,
        t.email,
        t.subject,
        t.message,
        t.image_url,
        t.status,
        t.created_at,
        t.updated_at,
        COUNT(tr.id) as response_count,
        MAX(tr.created_at) as last_response_at
      FROM tickets t
      LEFT JOIN ticket_responses tr ON t.id = tr.ticket_id
      WHERE t.chatbot_id = ${chatbotId}
      GROUP BY t.id, t.name, t.phone, t.email, t.subject, t.message, t.image_url, t.status, t.created_at, t.updated_at
      ORDER BY 
        CASE 
          WHEN t.status = 'open' THEN 1
          WHEN t.status = 'pending' THEN 2
          WHEN t.status = 'answered' THEN 3
          WHEN t.status = 'closed' THEN 4
          ELSE 5
        END,
        t.created_at DESC
    `

    return NextResponse.json({
      success: true,
      tickets,
    })
  } catch (error) {
    console.error("Error fetching chatbot tickets:", error)
    return NextResponse.json({ error: "خطا در دریافت تیکت‌های چت‌بات" }, { status: 500 })
  }
}
