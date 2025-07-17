import { type NextRequest, NextResponse } from "next/server"
import { syncChatbotFAQs, getChatbotFAQs } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const faqs = await getChatbotFAQs(chatbotId)
    return NextResponse.json(faqs)
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json({ error: "خطا در دریافت سوالات متداول" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const { faqs } = await request.json()

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "فرمت سوالات متداول نامعتبر است" }, { status: 400 })
    }

    const savedFAQs = await syncChatbotFAQs(chatbotId, faqs)
    return NextResponse.json(savedFAQs)
  } catch (error) {
    console.error("Error saving FAQs:", error)
    return NextResponse.json({ error: "خطا در ذخیره سوالات متداول" }, { status: 500 })
  }
}
