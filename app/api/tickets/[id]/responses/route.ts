import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "آیدی تیکت نامعتبر است" }, { status: 400 })
    }

    const responses = await sql`
      SELECT * FROM ticket_responses 
      WHERE ticket_id = ${ticketId} 
      ORDER BY created_at ASC
    `

    return NextResponse.json(responses)
  } catch (error) {
    console.error("Error fetching ticket responses:", error)
    return NextResponse.json({ error: "خطا در دریافت پاسخ‌ها" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "آیدی تیکت نامعتبر است" }, { status: 400 })
    }

    const { message, isAdmin, newStatus } = await request.json()
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "متن پاسخ الزامی است" }, { status: 400 })
    }

    // Add response to ticket
    const result = await sql`
      INSERT INTO ticket_responses (ticket_id, message, is_admin, created_at)
      VALUES (${ticketId}, ${message.trim()}, ${isAdmin || false}, NOW())
      RETURNING *
    `

    // Update ticket's updated_at timestamp
    await sql`
      UPDATE tickets 
      SET updated_at = NOW() 
      WHERE id = ${ticketId}
    `

    // If status is provided, update it
    if (newStatus) {
      await sql`
        UPDATE tickets 
        SET status = ${newStatus}, updated_at = NOW() 
        WHERE id = ${ticketId}
      `
    }

    return NextResponse.json({
      success: true,
      message: "پاسخ با موفقیت ثبت شد",
      response: result[0],
    })
  } catch (error) {
    console.error("Error adding ticket response:", error)
    return NextResponse.json({ error: "خطا در ثبت پاسخ" }, { status: 500 })
  }
}
