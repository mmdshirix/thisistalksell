import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import * as z from "zod"

const appearanceSchema = z.object({
  name: z.string().min(1, "نام الزامی است").max(100),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "کد رنگ نامعتبر است"),
})

async function getAdminUserFromSession(token: string) {
  try {
    const result = await sql`
      SELECT u.id, u.chatbot_id
      FROM chatbot_admin_sessions s
      JOIN chatbot_admin_users u ON s.user_id = u.id
      WHERE s.session_token = ${token} AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = true
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Session validation error:", error)
    return null
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const chatbotId = Number(params.id)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
  }

  // 1. Authentication
  const token = cookies().get(`auth_token_${chatbotId}`)?.value
  if (!token) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 })
  }

  const adminUser = await getAdminUserFromSession(token)
  if (!adminUser || adminUser.chatbot_id !== chatbotId) {
    return NextResponse.json({ error: "نشست نامعتبر یا منقضی شده است" }, { status: 403 })
  }

  // 2. Validation
  const body = await request.json()
  const validation = appearanceSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: "اطلاعات ورودی نامعتبر است", details: validation.error.errors }, { status: 400 })
  }

  const { name, primary_color } = validation.data

  // 3. Database Update
  try {
    await sql`
      UPDATE chatbots
      SET name = ${name}, primary_color = ${primary_color}
      WHERE id = ${chatbotId}
    `
    return NextResponse.json({ message: "تنظیمات ظاهری با موفقیت به‌روز شد" })
  } catch (error) {
    console.error("Error updating appearance:", error)
    return NextResponse.json({ error: "خطا در به‌روزرسانی تنظیمات در پایگاه داده" }, { status: 500 })
  }
}
