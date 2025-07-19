import { type NextRequest, NextResponse } from "next/server"
import { getChatbotById, updateChatbot, deleteChatbot } from "@/lib/db"
import type { Chatbot } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const chatbotId = Number(params.id)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
  }

  try {
    const chatbot = await getChatbotById(chatbotId)
    if (!chatbot) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    // Add CORS headers for widget loader
    const response = NextResponse.json(chatbot)
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type")

    return response
  } catch (error) {
    console.error(`Error fetching chatbot ${chatbotId}:`, error)
    return NextResponse.json({ error: "خطای سرور داخلی" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const chatbotId = Number(params.id)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
  }

  try {
    const body = (await request.json()) as Partial<Chatbot>
    const updatedChatbot = await updateChatbot(chatbotId, body)

    if (!updatedChatbot) {
      return NextResponse.json({ error: "چت‌بات یافت نشد یا به‌روزرسانی ناموفق بود" }, { status: 404 })
    }

    return NextResponse.json(updatedChatbot)
  } catch (error) {
    console.error(`Error updating chatbot ${chatbotId}:`, error)
    return NextResponse.json({ error: "خطای سرور داخلی" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const chatbotId = Number(params.id)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "آیدی چت‌بات نامعتبر است" }, { status: 400 })
  }

  try {
    const success = await deleteChatbot(chatbotId)
    if (!success) {
      return NextResponse.json({ error: "چت‌بات یافت نشد یا حذف ناموفق بود" }, { status: 404 })
    }
    return NextResponse.json({ message: "چت‌بات با موفقیت حذف شد" })
  } catch (error) {
    console.error(`Error deleting chatbot ${chatbotId}:`, error)
    return NextResponse.json({ error: "خطای سرور داخلی" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
