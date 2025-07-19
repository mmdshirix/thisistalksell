import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const body = await request.json()
    const { chatbotId, userPhone, subject, message, priority = "medium", imageUrl } = body

    if (!chatbotId || !userPhone || !subject || !message) {
      return NextResponse.json(
        { error: "Chatbot ID, phone, subject, and message are required" },
        { status: 400, headers: corsHeaders },
      )
    }

    // اطمینان از وجود جدول تیکت‌ها
    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        user_phone VARCHAR(20) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        priority VARCHAR(10) DEFAULT 'medium',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // ایجاد تیکت جدید
    const result = await sql`
      INSERT INTO tickets (chatbot_id, user_phone, subject, message, priority, image_url, created_at, updated_at)
      VALUES (${Number.parseInt(chatbotId)}, ${userPhone}, ${subject}, ${message}, ${priority}, ${imageUrl || null}, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json(
      {
        success: true,
        ticket: result[0],
        message: "تیکت شما با موفقیت ثبت شد",
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function GET(request: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbot_id")

    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400, headers: corsHeaders })
    }

    // اطمینان از وجود جدول تیکت‌ها
    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL,
        user_phone VARCHAR(20) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        priority VARCHAR(10) DEFAULT 'medium',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // دریافت تمام تیکت‌های چت‌بات
    const tickets = await sql`
      SELECT * FROM tickets 
      WHERE chatbot_id = ${Number.parseInt(chatbotId)}
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
    console.error("Error fetching tickets:", error)
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
