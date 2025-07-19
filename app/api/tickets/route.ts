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
    const { chatbotId, userName, userPhone, userEmail, subject, message, priority = "medium", imageUrl } = body

    if (!chatbotId || !userName || !userPhone || !subject || !message) {
      return NextResponse.json(
        { error: "Required fields: chatbotId, userName, userPhone, subject, message" },
        { status: 400, headers: corsHeaders },
      )
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

    // ایجاد تیکت جدید
    const result = await sql`
      INSERT INTO tickets (chatbot_id, user_name, user_phone, user_email, subject, message, priority, image_url)
      VALUES (${chatbotId}, ${userName}, ${userPhone}, ${userEmail || null}, ${subject}, ${message}, ${priority}, ${imageUrl || null})
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
