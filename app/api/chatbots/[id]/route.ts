import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getChatbot } = await import("@/lib/db")
    const chatbot = await getChatbot(Number.parseInt(params.id))

    if (!chatbot) {
      return NextResponse.json(
        {
          success: false,
          message: "چت‌بات یافت نشد",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: chatbot,
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
    const body = await request.json()

    const chatbot = await updateChatbot(Number.parseInt(params.id), body)

    if (!chatbot) {
      return NextResponse.json(
        {
          success: false,
          message: "چت‌بات یافت نشد",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: chatbot,
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { deleteChatbot } = await import("@/lib/db")
    const chatbot = await deleteChatbot(Number.parseInt(params.id))

    if (!chatbot) {
      return NextResponse.json(
        {
          success: false,
          message: "چت‌بات یافت نشد",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "چت‌بات با موفقیت حذف شد",
    })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در حذف چت‌بات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
