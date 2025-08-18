import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id
    if (!ticketId) {
      return NextResponse.json({ error: "آیدی تیکت نامعتبر است" }, { status: 400 })
    }

    const responses = await sql`
      SELECT id, message, is_admin, created_at FROM ticket_responses 
      WHERE ticket_id = ${ticketId} 
      ORDER BY created_at ASC
    `

    return NextResponse.json({ success: true, responses })
  } catch (error) {
    console.error("Error fetching ticket responses:", error)
    return NextResponse.json({ error: "خطا در دریافت پاسخ‌ها" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id
    const { message, isAdmin = false } = await request.json()

    if (!ticketId || !message) {
      return NextResponse.json({ error: "آیدی تیکت و متن پاسخ الزامی است" }, { status: 400 })
    }

    // Add response to ticket
    const result = await sql`
      INSERT INTO ticket_responses (ticket_id, message, is_admin, created_at)
      VALUES (${ticketId}, ${message}, ${isAdmin}, NOW())
      RETURNING id, message, is_admin, created_at
    `

    if (result.length === 0) {
      throw new Error("Failed to create response")
    }

    // Update ticket's updated_at timestamp and status based on response type
    if (isAdmin) {
      await sql`
        UPDATE tickets 
        SET status = 'answered', updated_at = NOW() 
        WHERE id = ${ticketId}
      `
    } else {
      await sql`
        UPDATE tickets 
        SET status = 'pending', updated_at = NOW() 
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
