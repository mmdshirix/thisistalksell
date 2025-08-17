import { type NextRequest, NextResponse } from "next/server"
import { getChatbotOptions, createChatbotOption } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 })
    }

    const options = await getChatbotOptions(chatbotId)
    return NextResponse.json(options)
  } catch (error) {
    console.error("Error fetching options:", error)
    return NextResponse.json({ error: "خطا در دریافت گزینه‌ها" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه نامعتبر" }, { status: 400 })
    }

    const body = await request.json()
    const { label, emoji, position } = body

    if (!label || label.trim() === "") {
      return NextResponse.json({ error: "برچسب گزینه الزامی است" }, { status: 400 })
    }

    const option = await createChatbotOption({
      chatbot_id: chatbotId,
      label: label.trim(),
      emoji: emoji || null,
      position: position || 0,
    })

    return NextResponse.json(option, { status: 201 })
  } catch (error) {
    console.error("Error creating option:", error)
    return NextResponse.json({ error: "خطا در ساخت گزینه" }, { status: 500 })
  }
}
