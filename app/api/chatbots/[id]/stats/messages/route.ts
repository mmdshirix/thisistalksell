import { type NextRequest, NextResponse } from "next/server"
import { getTotalMessageCount } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 })
    }

    const count = await getTotalMessageCount(chatbotId)
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching message stats:", error)
    return NextResponse.json({ error: "خطا در دریافت آمار پیام‌ها" }, { status: 500 })
  }
}
