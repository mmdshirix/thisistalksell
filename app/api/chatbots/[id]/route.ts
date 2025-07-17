import { type NextRequest, NextResponse } from "next/server"
import { getChatbot, updateChatbot, deleteChatbot, getChatbotFAQs, getChatbotProducts } from "@/lib/db"

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

    // Get FAQs and Products
    const [faqs, products] = await Promise.all([getChatbotFAQs(chatbotId), getChatbotProducts(chatbotId)])

    return NextResponse.json({
      ...chatbot,
      faqs,
      products,
    })
  } catch (error) {
    console.error("Error fetching chatbot:", error)
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
      return NextResponse.json({ error: "چت‌بات یافت نشد یا بروزرسانی نشد" }, { status: 404 })
    }

    return NextResponse.json(updatedChatbot)
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json({ error: "خطا در بروزرسانی چت‌بات" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const success = await deleteChatbot(chatbotId)
    if (!success) {
      return NextResponse.json({ error: "خطا در حذف چت‌بات" }, { status: 500 })
    }

    return NextResponse.json({ message: "چت‌بات با موفقیت حذف شد" })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json({ error: "خطا در حذف چت‌بات" }, { status: 500 })
  }
}
