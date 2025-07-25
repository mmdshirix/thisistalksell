import { type NextRequest, NextResponse } from "next/server"
import { getTicketById, getTicketResponses, updateTicketStatus } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = Number.parseInt(params.id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "آیدی تیکت نامعتبر است" }, { status: 400 })
    }

    const [ticket, responses] = await Promise.all([getTicketById(ticketId), getTicketResponses(ticketId)])

    if (!ticket) {
      return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({ ticket, responses })
  } catch (error) {
    console.error("Error fetching ticket details:", error)
    return NextResponse.json({ error: "خطا در دریافت اطلاعات تیکت" }, { status: 500 })
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

    await updateTicketStatus(ticketId, status)

    return NextResponse.json({ success: true, message: "وضعیت تیکت با موفقیت به‌روزرسانی شد" })
  } catch (error) {
    console.error("Error updating ticket status:", error)
    return NextResponse.json({ error: "خطا در به‌روزرسانی وضعیت تیکت" }, { status: 500 })
  }
}
