import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
// In a real-world scenario, you'd have robust authentication here.
// For this example, we assume the session is validated by middleware.

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id, 10)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const { name, primary_color } = await request.json()

    if (!name || !primary_color) {
      return NextResponse.json({ error: "نام و رنگ اصلی الزامی است" }, { status: 400 })
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(primary_color)) {
      return NextResponse.json({ error: "فرمت رنگ نامعتبر است. باید هگز کد ۶ رقمی باشد." }, { status: 400 })
    }

    const result = await sql`
      UPDATE chatbots
      SET name = ${name}, primary_color = ${primary_color}
      WHERE id = ${chatbotId}
    `

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({ message: "تنظیمات ظاهری با موفقیت ذخیره شد" })
  } catch (error) {
    console.error("Error updating appearance:", error)
    return NextResponse.json({ error: "خطا در بروزرسانی تنظیمات" }, { status: 500 })
  }
}
