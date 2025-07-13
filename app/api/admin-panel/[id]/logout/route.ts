import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const chatbotId = params.id
  const token = cookies().get(`auth_token_${chatbotId}`)?.value

  if (token) {
    // Delete session from DB
    await sql`DELETE FROM chatbot_admin_sessions WHERE session_token = ${token}`
    // Clear cookie
    cookies().set(`auth_token_${chatbotId}`, "", { expires: new Date(0), path: "/" })
  }

  return NextResponse.json({ message: "خروج با موفقیت انجام شد" })
}
