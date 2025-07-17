import { type NextRequest, NextResponse } from "next/server"
import { getChatbotFAQs, syncChatbotFAQs } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const faqs = await getChatbotFAQs(chatbotId)
    return NextResponse.json(faqs)
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const { faqs } = await request.json()

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "FAQs must be an array" }, { status: 400 })
    }

    // Validate FAQ structure
    for (const faq of faqs) {
      if (!faq.question || faq.question.trim() === "") {
        return NextResponse.json({ error: "All FAQs must have a question" }, { status: 400 })
      }
    }

    const savedFAQs = await syncChatbotFAQs(chatbotId, faqs)
    return NextResponse.json(savedFAQs)
  } catch (error) {
    console.error("Error saving FAQs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
