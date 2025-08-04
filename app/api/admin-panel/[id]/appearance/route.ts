import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id } = params

  try {
    const result = await sql`
      SELECT primary_color, secondary_color, text_color, bot_name, bot_avatar, user_avatar
      FROM chatbots
      WHERE id = ${id};
    `

    if (result.length === 0) {
      return NextResponse.json({ message: "Chatbot not found" }, { status: 404 })
    }

    const appearance = result[0]
    return NextResponse.json(appearance)
  } catch (error) {
    console.error("Error fetching chatbot appearance:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id } = params
  const { primary_color, secondary_color, text_color, bot_name, bot_avatar, user_avatar } = await request.json()

  try {
    await sql`
      UPDATE chatbots
      SET
        primary_color = ${primary_color},
        secondary_color = ${secondary_color},
        text_color = ${text_color},
        bot_name = ${bot_name},
        bot_avatar = ${bot_avatar},
        user_avatar = ${user_avatar}
      WHERE id = ${id};
    `
    return NextResponse.json({ message: "Appearance updated successfully" })
  } catch (error) {
    console.error("Error updating chatbot appearance:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
