import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function GET(request: Request, { params }: { params: { chatbotId: string } }) {
  const sql = getSql()
  const { chatbotId } = params
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    if (decoded.chatbotId !== chatbotId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const tickets = await sql`
      SELECT id, subject, status, created_at, user_phone, user_email
      FROM tickets
      WHERE chatbot_id = ${chatbotId}
      ORDER BY created_at DESC;
    `
    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error fetching tickets for chatbot:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
