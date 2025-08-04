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

    const ticket = await sql`
      SELECT *
      FROM tickets
      WHERE id = ${ticketId};
    `

    if (ticket.length === 0) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 })
    }
    return NextResponse.json(ticket[0])
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: ticketId } = params
  const { status } = await request.json()
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    verifyAdminToken(token) // Just verify token, assume admin can update tickets

    await sql`
      UPDATE tickets
      SET status = ${status}
      WHERE id = ${ticketId};
    `
    return NextResponse.json({ message: "Ticket status updated successfully" })
  } catch (error) {
    console.error("Error updating ticket status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
