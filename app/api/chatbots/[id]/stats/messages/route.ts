import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: chatbotId } = params
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    if (decoded.chatbotId !== chatbotId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const messages = await sql`
      SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count
      FROM messages
      WHERE chatbot_id = ${chatbotId}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date;
    `

    const statsMultiplierResult = await sql`
      SELECT stats_multiplier FROM chatbots WHERE id = ${chatbotId};
    `
    const statsMultiplier = statsMultiplierResult.length > 0 ? statsMultiplierResult[0].stats_multiplier : 1

    const multipliedMessages = messages.map((row) => ({
      date: row.date,
      count: Math.round(row.count * statsMultiplier),
    }))

    return NextResponse.json(multipliedMessages)
  } catch (error) {
    console.error("Error fetching message stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
