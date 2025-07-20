import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

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

    // اضافه کردن پاسخ جدید
    const result = await sql`
      INSERT INTO ticket_responses (ticket_id, message, is_admin, created_at)
      VALUES (${ticketId}, ${message.trim()}, ${isAdmin || false}, NOW())
      RETURNING *
    `

    // بروزرسانی تاریخ آخرین تغییر تیکت
    await sql`
      UPDATE tickets 
      SET updated_at = NOW() 
      WHERE id = ${ticketId}
    `

    // اگر وضعیت جدید مشخص شده، آن را بروزرسانی کن
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
