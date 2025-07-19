import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { phone: string } }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const phone = params.phone
    const url = new URL(request.url)
    const chatbotId = url.searchParams.get("chatbot_id")

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400, headers: corsHeaders })
    }

    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400, headers: corsHeaders })
    }

    // اطمینان از وجود جدول تیکت‌ها
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL,
          user_name VARCHAR(255) NOT NULL,
          user_phone VARCHAR(20) NOT NULL,
          user_email VARCHAR(255),
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          priority VARCHAR(20) DEFAULT 'medium',
          status VARCHAR(20) DEFAULT 'open',
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    } catch (setupError) {
      console.warn("Error setting up tickets table:", setupError)
    }

    // دریافت تیکت‌های کاربر
    const tickets = await sql`
      SELECT * FROM tickets 
      WHERE user_phone = ${phone} AND chatbot_id = ${chatbotId}
      ORDER BY created_at DESC
    `

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
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
