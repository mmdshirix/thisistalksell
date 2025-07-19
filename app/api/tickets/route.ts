import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const body = await request.json()
    const { chatbot_id, name, email, phone, subject, message, image_url } = body

    if (!chatbot_id || !subject || !message) {
      return NextResponse.json(
        { error: "chatbot_id, subject, and message are required" },
        { status: 400, headers: corsHeaders },
      )
    }

    // اطمینان از وجود جدول tickets
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

    const userIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const result = await sql`
      INSERT INTO tickets (chatbot_id, name, email, phone, subject, message, image_url, user_ip, user_agent)
      VALUES (${chatbot_id}, ${name}, ${email}, ${phone}, ${subject}, ${message}, ${image_url}, ${userIp}, ${userAgent})
      RETURNING *
    `

    return NextResponse.json(
      {
        success: true,
        message: "تیکت با موفقیت ارسال شد",
        ticket: result[0],
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json(
      {
        error: "خطا در ارسال تیکت",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function GET(request: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbot_id")

    if (!chatbotId) {
      return NextResponse.json({ error: "chatbot_id is required" }, { status: 400, headers: corsHeaders })
    }

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
