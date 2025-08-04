import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { phone: string } }) {
  const sql = getSql()
  const { phone } = params

  try {
    const tickets = await sql`
      SELECT id, chatbot_id, subject, status, created_at, user_email
      FROM tickets
      WHERE user_phone = ${phone}
      ORDER BY created_at DESC;
    `
    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error fetching tickets by user phone:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
