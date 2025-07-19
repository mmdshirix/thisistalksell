import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { phone: string } }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    console.log("User tickets API called for phone:", params.phone)

    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbot_id") || searchParams.get("chatbotId")

    if (!chatbotId) {
      console.log("Missing chatbotId")
      return NextResponse.json({ error: "chatbot_id is required" }, { status: 400, headers: corsHeaders })
    }

    const phone = decodeURIComponent(params.phone)
    console.log("Fetching tickets for phone:", phone, "chatbotId:", chatbotId)

    // اطمینان از وجود جدول tickets
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL,
          name VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(50),
          subject VARCHAR(500),
          message TEXT,
          image_url TEXT,
          status VARCHAR(50) DEFAULT 'open',
          priority VARCHAR(50) DEFAULT 'normal',
          user_ip VARCHAR(100),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      // اطمینان از وجود جدول ticket_responses
      await sql`
        CREATE TABLE IF NOT EXISTS ticket_responses (
          id SERIAL PRIMARY KEY,
          ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    } catch (setupError) {
      console.warn("Error setting up tables:", setupError)
    }

    // دریافت تیکت‌های کاربر
    const tickets = await sql`
      SELECT 
        t.id, 
        t.name,
        t.email,
        t.phone,
        t.subject, 
        t.message, 
        t.status, 
        t.priority,
        t.created_at, 
        t.image_url,
        (
          SELECT tr.message 
          FROM ticket_responses tr
          WHERE tr.ticket_id = t.id AND tr.is_admin = true 
          ORDER BY tr.created_at DESC 
          LIMIT 1
        ) as admin_response
      FROM tickets t
      WHERE t.chatbot_id = ${Number.parseInt(chatbotId)} 
        AND t.phone = ${phone}
      ORDER BY t.created_at DESC
    `

    console.log("Found tickets:", tickets.length)

    return NextResponse.json(
      {
        success: true,
        tickets: tickets || [],
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json(
      {
        error: "خطا در دریافت تیکت‌ها",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
