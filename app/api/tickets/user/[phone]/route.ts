import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { phone: string } }) {
  try {
    console.log("User tickets API called for phone:", params.phone)

    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbotId")

    if (!chatbotId) {
      console.log("Missing chatbotId")
      return NextResponse.json({ error: "chatbotId is required" }, { status: 400 })
    }

    const phone = decodeURIComponent(params.phone)
    console.log("Fetching tickets for phone:", phone, "chatbotId:", chatbotId)

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
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS name VARCHAR(255)`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS email VARCHAR(255)`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS subject VARCHAR(500)`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS message TEXT`
      await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS image_url TEXT`

      // Ensure ticket_responses table exists
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
        t.updated_at,
        t.image_url
      FROM tickets t
      WHERE t.chatbot_id = ${Number.parseInt(chatbotId)} 
        AND t.phone = ${phone}
      ORDER BY t.created_at DESC
    `

    console.log("Found tickets:", tickets.length)

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json(
      {
        error: "خطا در دریافت تیکت‌ها",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
