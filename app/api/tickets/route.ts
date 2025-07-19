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
    const { chatbotId, phone, name, subject, message, imageUrl } = body

    if (!chatbotId || !phone || !subject || !message) {
      return NextResponse.json(
        { error: "chatbotId, phone, subject, and message are required" },
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

    // ایجاد تیکت جدید
    const result = await sql`
      INSERT INTO tickets (chatbot_id, phone, name, subject, message, image_url)
      VALUES (${Number.parseInt(chatbotId)}, ${phone}, ${name || null}, ${subject}, ${message}, ${imageUrl || null})
      RETURNING *
    `

    const ticket = result[0]

    return NextResponse.json(
      {
        success: true,
        message: "تیکت شما با موفقیت ثبت شد",
        ticket,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error creating ticket:", error)
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
