import { type NextRequest, NextResponse } from "next/server"
import { getChatbot, updateChatbot } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const chatbot = await getChatbot(chatbotId)
    if (!chatbot) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    return NextResponse.json(chatbot)
  } catch (error) {
    console.error(`Error fetching chatbot ${params.id}:`, error)
    return NextResponse.json({ error: "خطا در دریافت اطلاعات چت‌بات" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const body = await request.json()
    const updatedChatbot = await updateChatbot(chatbotId, body)

    if (!updatedChatbot) {
      return NextResponse.json({ error: "چت‌بات برای به‌روزرسانی یافت نشد" }, { status: 404 })
    }

    return NextResponse.json(updatedChatbot)
  } catch (error) {
    console.error(`Error updating chatbot ${params.id}:`, error)
    return NextResponse.json({ error: "خطا در به‌روزرسانی چت‌بات" }, { status: 500 })
  }
}
