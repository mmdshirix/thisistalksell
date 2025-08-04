import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id } = params

  try {
    const result = await sql`
      SELECT show_product_suggestions, show_faq_suggestions, show_quick_options, show_ticket_form
      FROM chatbots
      WHERE id = ${id};
    `

    if (result.length === 0) {
      return NextResponse.json({ message: "Chatbot not found" }, { status: 404 })
    }

    const options = result[0]
    return NextResponse.json(options)
  } catch (error) {
    console.error("Error fetching chatbot options:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id } = params
  const { show_product_suggestions, show_faq_suggestions, show_quick_options, show_ticket_form } = await request.json()

  try {
    await sql`
      UPDATE chatbots
      SET
        show_product_suggestions = ${show_product_suggestions},
        show_faq_suggestions = ${show_faq_suggestions},
        show_quick_options = ${show_quick_options},
        show_ticket_form = ${show_ticket_form}
      WHERE id = ${id};
    `
    return NextResponse.json({ message: "Options updated successfully" })
  } catch (error) {
    console.error("Error updating chatbot options:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
