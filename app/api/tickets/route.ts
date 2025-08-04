import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function GET(request: Request) {
  const sql = getSql()
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    verifyAdminToken(token) // Just verify token, assume admin can see all tickets for now

    const tickets = await sql`
      SELECT id, chatbot_id, subject, status, created_at, user_phone, user_email
      FROM tickets
      ORDER BY created_at DESC;
    `
    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error fetching all tickets:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const sql = getSql()
  const { chatbot_id, user_id, subject, message, user_phone, user_email, image_url } = await request.json()

  try {
    const result = await sql`
      INSERT INTO tickets (chatbot_id, user_id, subject, message, user_phone, user_email, image_url)
      VALUES (${chatbot_id}, ${user_id}, ${subject}, ${message}, ${user_phone}, ${user_email}, ${image_url})
      RETURNING id;
    `
    return NextResponse.json({ message: "Ticket created", id: result[0].id })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
