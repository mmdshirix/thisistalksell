import { type NextRequest, NextResponse } from "next/server"
import { addTicketResponse, updateTicketStatus } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "آیدی تیکت نامعتبر است" }, { status: 400 })
    }

    const { message, isAdmin, newStatus } = await request.json()
    if (!message) {
      return NextResponse.json({ error: "متن پاسخ الزامی است" }, { status: 400 })
    }

    await addTicketResponse(ticketId, message, isAdmin)

    // Optionally update status upon response
    if (newStatus) {
      await updateTicketStatus(ticketId, newStatus)
    }

    return NextResponse.json({ success: true, message: "پاسخ با موفقیت ثبت شد" })
  } catch (error) {
    console.error("Error adding ticket response:", error)
    return NextResponse.json({ error: "خطا در ثبت پاسخ" }, { status: 500 })
  }
}
