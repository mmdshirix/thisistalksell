import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { phone: string } }) {
  try {
    const phone = params.phone
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbotId")

    if (!phone || !chatbotId) {
      return NextResponse.json({ error: "Phone number and chatbotId are required" }, { status: 400 })
    }

    // Get all tickets for this phone number and chatbot
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
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', tr.id,
              'message', tr.message,
              'is_admin', tr.is_admin,
              'created_at', tr.created_at
            ) ORDER BY tr.created_at ASC
          ) FILTER (WHERE tr.id IS NOT NULL),
          '[]'::json
        ) as responses
      FROM tickets t
      LEFT JOIN ticket_responses tr ON t.id = tr.ticket_id
      WHERE t.phone = ${phone} AND t.chatbot_id = ${chatbotId}
      GROUP BY t.id, t.name, t.phone, t.email, t.subject, t.message, t.image_url, t.status, t.created_at, t.updated_at
      ORDER BY t.created_at DESC
    `

    return NextResponse.json({
      success: true,
      tickets,
    })
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json({ error: "خطا در دریافت تیکت‌های کاربر" }, { status: 500 })
  }
}
