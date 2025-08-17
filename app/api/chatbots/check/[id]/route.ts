import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
    }

    const result = await sql`SELECT name FROM chatbots WHERE id = ${chatbotId}`

    if (result.length === 0) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({ name: result[0].name })
  } catch (error) {
    console.error("Error checking chatbot:", error)
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 })
  }
}
