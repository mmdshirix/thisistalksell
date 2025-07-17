import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
    }

    const cookieStore = cookies()
    const token = cookieStore.get(`auth_token_${chatbotId}`)?.value

    if (token) {
      // Dynamic import to avoid build-time issues
      const { sql } = await import("@/lib/db")

      // Delete session from database
      await sql`DELETE FROM chatbot_admin_sessions WHERE session_token = ${token}`
    }

    // Clear cookie
    cookieStore.set(`auth_token_${chatbotId}`, "", {
      expires: new Date(0),
      path: "/",
    })

    return NextResponse.json({ message: "خروج با موفقیت انجام شد" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 })
  }
}
