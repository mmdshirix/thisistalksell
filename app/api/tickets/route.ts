import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("Tickets API called")

    const body = await request.json()
    console.log("Request body:", body)

    const { chatbot_id, name, email, phone, subject, message, image_url } = body

    if (!chatbot_id || !name || !email || !subject || !message) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "داده‌های ناقص" }, { status: 400 })
    }

    // Get user IP and user agent
    const userIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    console.log("Creating ticket with data:", {
      chatbot_id: Number.parseInt(chatbot_id),
      name: name.trim(),
      email: email.trim(),
      phone: phone || null,
      subject: subject.trim(),
      message: message.trim(),
      image_url: image_url || null,
      user_ip: userIp,
      user_agent: userAgent,
    })

    // Ensure tickets table has all required columns
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

      // Add missing columns if they don't exist
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS name VARCHAR(255)`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS email VARCHAR(255)`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS subject VARCHAR(500)`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS message TEXT`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS image_url TEXT`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open'`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'normal'`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_ip VARCHAR(100)`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_agent TEXT`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
    } catch (setupError) {
      console.warn("Error setting up tickets table:", setupError)
    }

    const result = await sql`
      INSERT INTO tickets (
        chatbot_id, name, email, phone, subject, message,
        image_url, status, priority, user_ip, user_agent, created_at, updated_at
      )
      VALUES (
        ${Number.parseInt(chatbot_id)}, ${name.trim()}, ${email.trim()}, ${phone || null},
        ${subject.trim()}, ${message.trim()}, ${image_url || null}, 'open',
        'normal', ${userIp}, ${userAgent}, NOW(), NOW()
      )
      RETURNING *
    `

    const ticket = result[0]
    console.log("Ticket created successfully:", ticket.id)

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json(
      {
        error: "خطا در ساخت تیکت",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbotId")

    if (!chatbotId) {
      return NextResponse.json({ error: "chatbotId is required" }, { status: 400 })
    }

    const tickets = await sql`
      SELECT * FROM tickets 
      WHERE chatbot_id = ${Number.parseInt(chatbotId)} 
      ORDER BY created_at DESC
    `

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json(
      {
        error: "خطا در دریافت تیکت‌ها",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
