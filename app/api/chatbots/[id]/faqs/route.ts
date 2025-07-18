import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    // Dynamic import to avoid build-time issues
    const { getChatbotFAQs } = await import("@/lib/db")

    const faqs = await getChatbotFAQs(chatbotId)
    return NextResponse.json(faqs)
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const body = await request.json()
    const { faqs } = body

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "FAQs must be an array" }, { status: 400 })
    }

    // Dynamic import to avoid build-time issues
    const { syncChatbotFAQs } = await import("@/lib/db")

    const updatedFAQs = await syncChatbotFAQs(chatbotId, faqs)
    return NextResponse.json(updatedFAQs)
  } catch (error) {
    console.error("Error syncing FAQs:", error)
    return NextResponse.json({ error: "Failed to sync FAQs" }, { status: 500 })
  }
}
