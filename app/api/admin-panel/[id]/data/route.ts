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

    const chatbot = await sql`SELECT * FROM chatbots WHERE id = ${chatbotId}`
    const faqs = await sql`SELECT * FROM faqs WHERE chatbot_id = ${chatbotId}`
    const products = await sql`SELECT * FROM suggested_products WHERE chatbot_id = ${chatbotId}`
    const adminUsers = await sql`SELECT id, username FROM admin_users WHERE chatbot_id = ${chatbotId}`

    return NextResponse.json({
      chatbot: chatbot.length > 0 ? chatbot[0] : null,
      faqs,
      products,
      adminUsers,
    })
  } catch (error) {
    console.error("Error fetching admin panel data:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
