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
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbot_id")
    const phone = params.phone

    if (!phone || !chatbotId) {
      return NextResponse.json(
        { error: "Phone number and chatbot_id are required" },
        { status: 400, headers: corsHeaders },
      )
    }

    // اطمینان از وجود جدول تیکت‌ها
    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        phone VARCHAR(20) NOT NULL,
        name VARCHAR(255),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'medium',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // دریافت تیکت‌های کاربر
    const tickets = await sql`
      SELECT * FROM tickets 
      WHERE phone = ${phone} AND chatbot_id = ${Number.parseInt(chatbotId)}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ tickets }, { headers: corsHeaders })
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
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
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
