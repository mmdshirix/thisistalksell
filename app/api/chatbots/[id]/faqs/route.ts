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

    const faqs = await sql`SELECT * FROM faqs WHERE chatbot_id = ${chatbotId};`
    return NextResponse.json(faqs)
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: chatbotId } = params
  const { question, answer } = await request.json()
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
      INSERT INTO faqs (chatbot_id, question, answer)
      VALUES (${chatbotId}, ${question}, ${answer})
      RETURNING id;
    `
    return NextResponse.json({ message: "FAQ added", id: result[0].id })
  } catch (error) {
    console.error("Error adding FAQ:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: faqId } = params // Assuming 'id' here refers to faqId for DELETE
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    // You might want to verify if the FAQ belongs to the chatbotId from the token
    const faq = await sql`SELECT chatbot_id FROM faqs WHERE id = ${faqId};`
    if (faq.length === 0 || faq[0].chatbot_id !== decoded.chatbotId) {
      return NextResponse.json({ message: "Forbidden or FAQ not found" }, { status: 403 })
    }

    await sql`DELETE FROM faqs WHERE id = ${faqId};`
    return NextResponse.json({ message: "FAQ deleted successfully" })
  } catch (error) {
    console.error("Error deleting FAQ:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
