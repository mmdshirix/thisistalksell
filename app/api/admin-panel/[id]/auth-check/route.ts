import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

async function verifySession(token: string) {
  try {
    const sessions = await sql`
      SELECT user_id FROM chatbot_admin_sessions
      WHERE session_token = ${token} AND expires_at > NOW()
    `
    return sessions.length > 0 ? sessions[0] : null
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const chatbotId = params.id
  const token = cookies().get(`auth_token_${chatbotId}`)?.value

  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const session = await verifySession(token)

  if (!session) {
    // Clear invalid cookie
    cookies().set(`auth_token_${chatbotId}`, "", { expires: new Date(0), path: "/" })
    return new NextResponse("Unauthorized", { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
