import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
    }

    const cookieStore = cookies()
    const token = cookieStore.get(`auth_token_${chatbotId}`)?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Dynamic import to avoid build-time issues
    const { sql } = await import("@/lib/db")

    // Check if session exists and is valid
    const session = await sql`
      SELECT s.*, u.username, u.full_name, u.role, u.chatbot_id
      FROM chatbot_admin_sessions s
      JOIN chatbot_admin_users u ON s.user_id = u.id
      WHERE s.session_token = ${token} 
      AND s.expires_at > NOW()
      AND u.chatbot_id = ${chatbotId}
      AND u.is_active = true
    `

    if (session.length === 0) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = session[0]
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        chatbot_id: user.chatbot_id,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
