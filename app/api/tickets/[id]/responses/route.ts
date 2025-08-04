import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: ticketId } = params
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    verifyAdminToken(token) // Just verify token, assume admin can see all tickets for now

    const responses = await sql`
      SELECT id, ticket_id, message, is_admin, created_at
      FROM ticket_responses
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC;
    `
    return NextResponse.json(responses)
  } catch (error) {
    console.error("Error fetching ticket responses:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: ticketId } = params
  const { message, isAdmin } = await request.json()
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    verifyAdminToken(token) // Just verify token, assume admin can add responses

    const result = await sql`
      INSERT INTO ticket_responses (ticket_id, message, is_admin)
      VALUES (${ticketId}, ${message}, ${isAdmin})
      RETURNING id;
    `
    return NextResponse.json({ message: "Response added", id: result[0].id })
  } catch (error) {
    console.error("Error adding ticket response:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
