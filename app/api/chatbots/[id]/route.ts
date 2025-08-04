import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id } = params
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    if (decoded.chatbotId !== id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const result = await sql`SELECT * FROM chatbots WHERE id = ${id};`
    if (result.length === 0) {
      return NextResponse.json({ message: "Chatbot not found" }, { status: 404 })
    }
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id } = params
  const {
    name,
    description,
    welcome_message,
    primary_color,
    secondary_color,
    text_color,
    bot_name,
    bot_avatar,
    user_avatar,
    show_product_suggestions,
    show_faq_suggestions,
    show_quick_options,
    show_ticket_form,
    model,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
    stats_multiplier,
  } = await request.json()
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    if (decoded.chatbotId !== id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await sql`
      UPDATE chatbots
      SET
        name = ${name},
        description = ${description},
        welcome_message = ${welcome_message},
        primary_color = ${primary_color},
        secondary_color = ${secondary_color},
        text_color = ${text_color},
        bot_name = ${bot_name},
        bot_avatar = ${bot_avatar},
        user_avatar = ${user_avatar},
        show_product_suggestions = ${show_product_suggestions},
        show_faq_suggestions = ${show_faq_suggestions},
        show_quick_options = ${show_quick_options},
        show_ticket_form = ${show_ticket_form},
        model = ${model},
        temperature = ${temperature},
        max_tokens = ${max_tokens},
        top_p = ${top_p},
        frequency_penalty = ${frequency_penalty},
        presence_penalty = ${presence_penalty},
        stats_multiplier = ${stats_multiplier}
      WHERE id = ${id};
    `
    return NextResponse.json({ message: "Chatbot updated successfully" })
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
