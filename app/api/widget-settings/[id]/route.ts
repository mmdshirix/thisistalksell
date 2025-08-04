import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id } = params

  try {
    const result = await sql`
      SELECT welcome_message, primary_color, secondary_color, text_color,
             bot_name, bot_avatar, user_avatar, show_product_suggestions,
             show_faq_suggestions, show_quick_options, show_ticket_form
      FROM chatbots
      WHERE id = ${id};
    `

    if (result.length === 0) {
      return NextResponse.json({ message: "Chatbot not found" }, { status: 404 })
    }

    const settings = result[0]
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching widget settings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
