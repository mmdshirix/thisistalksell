import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getChatbotFAQs } = await import("@/lib/db")
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ success: false, message: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const result = await getChatbotFAQs(chatbotId)
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    })
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json(
      {
        success: false,
        data: [],
        message: `خطا در دریافت سوالات متداول: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { addChatbotFAQ } = await import("@/lib/db")
    const chatbotId = Number.parseInt(params.id)
    const body = await request.json()

    if (isNaN(chatbotId)) {
      return NextResponse.json({ success: false, message: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const result = await addChatbotFAQ(chatbotId, body.question, body.answer)
    return NextResponse.json(result, {
      status: result.success ? 201 : 500,
    })
  } catch (error) {
    console.error("Error adding FAQ:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در اضافه کردن سوال متداول: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
