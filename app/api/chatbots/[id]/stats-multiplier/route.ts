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

    const result = await sql`
      SELECT stats_multiplier
      FROM chatbots
      WHERE id = ${chatbotId};
    `

    if (result.length === 0) {
      return NextResponse.json({ message: "Chatbot not found" }, { status: 404 })
    }

    return NextResponse.json({ statsMultiplier: result[0].stats_multiplier })
  } catch (error) {
    console.error("Error fetching stats multiplier:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: chatbotId } = params
  const { statsMultiplier } = await request.json()
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    if (decoded.chatbotId !== chatbotId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await sql`
      UPDATE chatbots
      SET stats_multiplier = ${statsMultiplier}
      WHERE id = ${chatbotId};
    `
    return NextResponse.json({ message: "Stats multiplier updated successfully" })
  } catch (error) {
    console.error("Error updating stats multiplier:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
