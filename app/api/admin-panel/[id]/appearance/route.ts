import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { z } from "zod"

// Helper function to verify session
async function getAdminUserFromSession(chatbotId: number): Promise<any | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(`auth_token_${chatbotId}`)?.value

    if (!token) {
      return null
    }

    const sessionResult = await sql`
      SELECT s.user_id, s.expires_at
      FROM chatbot_admin_sessions s
      JOIN chatbot_admin_users u ON s.user_id = u.id
      WHERE s.session_token = ${token} AND u.chatbot_id = ${chatbotId} AND u.is_active = TRUE
    `

    if (sessionResult.length === 0) {
      return null
    }

    const session = sessionResult[0]
    if (new Date(session.expires_at) < new Date()) {
      await sql`DELETE FROM chatbot_admin_sessions WHERE session_token = ${token}`
      return null
    }

    return { id: session.user_id }
  } catch (error) {
    console.error("Error validating admin session:", error)
    return null
  }
}

const appearanceSchema = z.object({
  name: z.string().min(1, "نام چت‌بات الزامی است"),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "رنگ نامعتبر است"),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
    }

    // Verify admin session
    const adminUser = await getAdminUserFromSession(chatbotId)
    if (!adminUser) {
      return NextResponse.json({ error: "احراز هویت ناموفق" }, { status: 401 })
    }

    const body = await request.json()
    const validation = appearanceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "داده‌های ورودی نامعتبر",
          details: validation.error.errors,
        },
        { status: 400 },
      )
    }

    const { name, primary_color } = validation.data

    // Update chatbot appearance
    await sql`
      UPDATE chatbots 
      SET name = ${name}, primary_color = ${primary_color}, updated_at = NOW()
      WHERE id = ${chatbotId}
    `

    return NextResponse.json({
      message: "تنظیمات ظاهری با موفقیت بروزرسانی شد",
      data: { name, primary_color },
    })
  } catch (error) {
    console.error("Error updating appearance:", error)
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 })
  }
}
