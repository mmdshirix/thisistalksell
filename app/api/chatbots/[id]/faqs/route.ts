import { NextResponse } from "next/server"
import { syncChatbotFAQs, getChatbotFAQs, type ChatbotFAQ } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const chatbotId = Number.parseInt(params.id, 10)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
  }

  try {
    const faqs = await getChatbotFAQs(chatbotId)
    return NextResponse.json(faqs)
  } catch (error) {
    console.error(`[API GET /faqs] Error fetching FAQs for chatbot ${chatbotId}:`, error)
    return NextResponse.json({ error: "خطا در دریافت سوالات متداول" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const chatbotId = Number.parseInt(params.id, 10)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
  }

  try {
    const faqs = (await request.json()) as Partial<ChatbotFAQ>[]
    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "داده‌های ارسالی باید یک آرایه از سوالات باشد" }, { status: 400 })
    }

    const validFaqs = faqs
      .filter((faq) => faq.question?.trim() && faq.answer?.trim())
      .map((faq, index) => ({
        chatbot_id: chatbotId,
        question: faq.question!.trim(),
        answer: faq.answer!.trim(),
        emoji: faq.emoji || "❓",
        position: index,
      }))

    const updatedFAQs = await syncChatbotFAQs(chatbotId, validFaqs)
    return NextResponse.json(updatedFAQs)
  } catch (error) {
    console.error(`[API PUT /faqs] Error syncing FAQs for chatbot ${chatbotId}:`, error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "خطای داخلی سرور در ذخیره سوالات", details: errorMessage }, { status: 500 })
  }
}
