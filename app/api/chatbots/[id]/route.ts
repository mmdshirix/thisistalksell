import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getChatbotById } = await import("@/lib/db")
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "شناسه چت‌بات نامعتبر است",
        },
        { status: 400 },
      )
    }

    const result = await getChatbotById(id)

    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
    })
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در دریافت چت‌بات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { updateChatbot } = await import("@/lib/db")
    const id = Number.parseInt(params.id)
    const body = await request.json()

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "شناسه چت‌بات نامعتبر است",
        },
        { status: 400 },
      )
    }

    const result = await updateChatbot(id, body)

    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
    })
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در بروزرسانی چت‌بات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
