import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "آیدی تیکت نامعتبر است" }, { status: 400 })
    }

    // Get ticket details
    const ticketResult = await sql`
      SELECT * FROM tickets WHERE id = ${ticketId}
    `

    if (ticketResult.length === 0) {
      return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 })
    }

    // Get ticket responses
    const responsesResult = await sql`
      SELECT * FROM ticket_responses 
      WHERE ticket_id = ${ticketId} 
      ORDER BY created_at ASC
    `

    return NextResponse.json({
      ticket: ticketResult[0],
      responses: responsesResult,
    })
  } catch (error) {
    console.error("Error fetching ticket details:", error)
    return NextResponse.json({ error: "خطا در دریافت اطلاعات تیکت" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "آیدی تیکت نامعتبر است" }, { status: 400 })
    }

    const { message, isAdmin } = await request.json()
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

    // If admin response, update status to in_progress if it was open
    if (isAdmin) {
      await sql`
        UPDATE tickets 
        SET status = CASE 
          WHEN status = 'open' THEN 'in_progress'
          ELSE status
        END
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "آیدی تیکت نامعتبر است" }, { status: 400 })
    }

    const { status } = await request.json()
    if (!status) {
      return NextResponse.json({ error: "وضعیت (status) الزامی است" }, { status: 400 })
    }

    // Update ticket status
    await sql`
      UPDATE tickets 
      SET status = ${status}, updated_at = NOW() 
      WHERE id = ${ticketId}
    `

    return NextResponse.json({ success: true, message: "وضعیت تیکت با موفقیت به‌روزرسانی شد" })
  } catch (error) {
    console.error("Error updating ticket status:", error)
    return NextResponse.json({ error: "خطا در به‌روزرسانی وضعیت تیکت" }, { status: 500 })
  }
}
