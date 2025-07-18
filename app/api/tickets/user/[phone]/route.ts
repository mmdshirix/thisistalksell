import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { phone: string } }) {
  try {
    console.log("User tickets API called for phone:", params.phone)

    const phone = decodeURIComponent(params.phone)
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbotId")

    if (!chatbotId) {
      console.log("Missing chatbotId")
      return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400 })
    }

    // Dynamic import to avoid build-time issues
    const { sql } = await import("@/lib/db")

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
      SELECT * FROM tickets 
      WHERE phone = ${phone} AND chatbot_id = ${Number.parseInt(chatbotId)}
      ORDER BY created_at DESC
    `

    console.log("Found tickets:", tickets.length)

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json({ error: "Failed to fetch user tickets" }, { status: 500 })
  }
}
